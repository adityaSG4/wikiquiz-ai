import json
import os
import itertools
import time
import threading
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field, model_validator
from typing import List
from config import Config

# Key Rotation Logic
keys_str = os.getenv('GOOGLE_API_KEYS')
if keys_str:
    # Split by comma and strip whitespace
    API_KEYS = [k.strip() for k in keys_str.split(',') if k.strip()]
else:
    # Fallback to single key
    single_key = os.getenv('GOOGLE_API_KEY')
    API_KEYS = [single_key] if single_key else []

if not API_KEYS:
    print("Warning: No GOOGLE_API_KEYS or GOOGLE_API_KEY found.")

# Cycle through keys
key_cycle = itertools.cycle(API_KEYS)
# Initial key
current_key = next(key_cycle) if API_KEYS else None
key_lock = threading.Lock()

def get_current_key():
    return current_key

def rotate_key():
    global current_key
    if not API_KEYS:
        return None
    
    with key_lock:
        # Move to next key safely
        # Note: In a race, multiple threads might wait here. 
        # When thread A rotates, current_key changes. 
        # Thread B enters. We should arguably check if the key is still the one that failed for B, 
        # but simpler is just to rotate to the next one available in the cycle.
        prev_key = current_key
        current_key = next(key_cycle)
        print(f"🔄 Rotating API Key: ...{prev_key[-4:]} -> ...{current_key[-4:]}")
    
    return current_key

def get_llm():
    """Returns a new LLM instance with the current active key."""
    if not current_key:
        raise ValueError("No Google API Key available.")
    return ChatGoogleGenerativeAI(
        model=Config.GEMINI_MODEL,
        temperature=0.7,
        google_api_key=current_key
    )

def run_with_retry(chain_creator_func, input_data, max_retries=None):
    """
    Executes a LangChain chain with key rotation on failure.
    chain_creator_func: A function that accepts an 'llm' instance and returns a chain.
    """
    if max_retries is None:
        # Try enough times to cycle through all keys multiple times
        max_retries = len(API_KEYS) * 5 if API_KEYS else 3
    
    last_error = None
    
    for attempt in range(max_retries):
        try:
            # Always get the latest key
            llm = get_llm()
            chain = chain_creator_func(llm)
            return chain.invoke(input_data)
        except Exception as e:
            error_msg = str(e)
            is_quota_error = "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg
            
            if is_quota_error:
                print(f"⚠️ Quota exceeded on key ...{current_key[-4:] if current_key else 'None'}. (Attempt {attempt + 1}/{max_retries})")
            else:
                print(f"⚠️ Error on key ...{current_key[-4:] if current_key else 'None'}: {e}. (Attempt {attempt + 1}/{max_retries})")
            
            last_error = e
            # Rotate key and retry
            rotate_key()
            
            # Wait a bit before retrying to let the new key settle or the old one cool down
            # If we have many keys, we can switch fast. If few, wait longer.
            wait_time = 1.0 if len(API_KEYS) > 1 else 5.0
            time.sleep(wait_time)
            
    raise Exception(f"All API keys failed after {max_retries} attempts. Last error: {last_error}")

# --- Summary Generation ---

def generate_summary(text):
    """Generates a concise summary of the article."""
    template = """
    You are an expert summarizer.
    Summarize the following Wikipedia article text in a concise, factual paragraph (approx 3-5 sentences).
    Do not add outside information.
    
    Article Text:
    {text}
    
    Summary:
    """
    
    def create_chain(llm):
        prompt = PromptTemplate(template=template, input_variables=["text"])
        return prompt | llm

    try:
        response = run_with_retry(create_chain, {"text": text})
        return response.content.strip()
    except Exception as e:
        print(f"Error generating summary: {e}")
        return "Summary generation failed."

# --- Quiz Generation ---

# Pydantic models for structured output
class Question(BaseModel):
    question: str = Field(description="The quiz question text")
    options: List[str] = Field(description="List of 4 distinct options")
    correct_answer: str = Field(description="The correct answer text (must be one of the options)")
    explanation: str = Field(description="Explanation of why the answer is correct, citing the text")
    difficulty: str = Field(description="Difficulty level: Easy, Medium, or Hard")

    @model_validator(mode='after')
    def check_answer_in_options(self):
        # Ensure correct_answer is exactly one of the options
        if self.correct_answer not in self.options:
            # Try to find a close match (case insensitive or stripped)
            clean_answer = self.correct_answer.strip().lower()
            for opt in self.options:
                if opt.strip().lower() == clean_answer:
                    self.correct_answer = opt # Auto-correct to match option format
                    return self
            
            # If still not found, check if answer is a prefix "Option A" etc.
            # This is complex, but for now, failing is safer than unanswerable questions.
            # However, to be more resilient, we could append the correct answer to options?
            # No, that's messy. Let's trigger a failure (retry).
            raise ValueError(f"Correct answer '{self.correct_answer}' not found in options: {self.options}")
        return self

class QuizOutput(BaseModel):
    questions: List[Question] = Field(description="List of 5 to 10 quiz questions")
    related_topics: List[str] = Field(description="List of 3 related Wikipedia topics")

parser = PydanticOutputParser(pydantic_object=QuizOutput)

def generate_quiz(text):
    """Generates 5-10 quiz questions based solely on the text."""
    template = """
    You are an expert quiz creator.
    Create a quiz with 5 to 10 questions based ONLY on the provided article text.
    
    Constraints:
    1. STRICTLY output valid JSON.
    2. Do NOT hallucinate. All answers must be found in the text.
    3. Provide 4 options for each question.
    4. Provide the correct answer and a brief explanation.
    5. varied difficulty (Easy, Medium, Hard).
    6. Also suggest 3 related Wikipedia topics.
    
    Article Text:
    {text}
    
    {format_instructions}
    """
    
    def create_chain(llm):
        prompt = PromptTemplate(
            template=template,
            input_variables=["text"],
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        return prompt | llm
    
    try:
        response = run_with_retry(create_chain, {"text": text})
        # Parse the output to ensure it matches specific structure
        parsed_output = parser.parse(response.content)
        # Convert back to dict for JSON serialization
        return parsed_output.dict()
    except Exception as e:
        print(f"Error generating quiz: {e}")
        raise Exception("Failed to generate valid quiz JSON from AI")
