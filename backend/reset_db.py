import os
from app import app
from database import db
from datetime import datetime

if __name__ == "__main__":
    with app.app_context():
        confirm = input("Are you sure you want to DROP all tables? This cannot be undone! (yes/no): ")
        if confirm.lower() == "yes" and os.getenv("FLASK_ENV") == "development":
            print("Dropping all tables..." + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            db.drop_all()
            print("All tables dropped successfully." + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
