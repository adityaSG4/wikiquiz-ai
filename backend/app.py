import os  
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

from config import Config
from database import init_db, db
from routes.main import main_bp
from routes.auth import auth_bp

app = Flask(__name__)
app.config.from_object(Config)

# CORS (Vite frontend)
CORS(
    app,
    supports_credentials=True,
    origins=[app.config['FRONTEND_URL']]
)

# Initialize DB and Migrations
init_db(app)
migrate = Migrate(app, db)

# Initialize JWT
jwt = JWTManager(app)

# Register Blueprints
app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)


if __name__ == '__main__':
    app.run(
        debug=os.getenv('FLASK_ENV') != 'production',
        port=5000
    )

