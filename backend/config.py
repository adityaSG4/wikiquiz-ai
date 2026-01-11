import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:

    # ======================
    # Database
    # ======================
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ======================
    # Third-party APIs
    # ======================
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    GOOGLE_API_KEYS = os.getenv('GOOGLE_API_KEYS')

    # ======================
    # Frontend
    # ======================
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')


    # ======================
    # JWT Configuration
    # ======================
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        raise ValueError("No JWT_SECRET_KEY set for Flask application")
    
    # Return CSRF in JSON response, not as separate cookies
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_COOKIE_CSRF_PROTECT = True    # Enabled for security
    JWT_CSRF_IN_COOKIES = False
    
    JWT_ACCESS_COOKIE_NAME = 'access_token_cookie'
    JWT_REFRESH_COOKIE_NAME = 'refresh_token_cookie'
    
    # Expiration
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Cookie Security
    # In production, set JWT_COOKIE_SECURE to True
    # JWT_COOKIE_SECURE = os.getenv('FLASK_ENV') == 'production'
    JWT_COOKIE_SECURE = True
    JWT_COOKIE_SAMESITE = 'None'
    
    # ======================
    # AI / LLM
    # ======================
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash-lite')

