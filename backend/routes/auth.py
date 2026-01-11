from flask import Blueprint, request, jsonify
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, set_access_cookies, set_refresh_cookies, unset_jwt_cookies, get_csrf_token
from email_validator import validate_email, EmailNotValidError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    # Strict Validation
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400

    if len(username) > 12:
        return jsonify({"error": "Username must be 12 characters or less"}), 400
        
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    try:
        valid = validate_email(email)
        email = valid.email
    except EmailNotValidError as e:
        return jsonify({"error": str(e)}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "User already exists"}), 409

    new_user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password)
    )
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
         return jsonify({"error": "Missing credentials"}), 400

    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Security: Ensure identity is always a string to avoid type confusion 
    # and potential bypasses in some JWT implementations
    identity_str = str(user.id)
    
    access_token = create_access_token(identity=identity_str)
    refresh_token = create_refresh_token(identity=identity_str)

    response = jsonify({
        "message": "Login successful", 
        "user": {"id": user.id, "username": user.username},
        'csrf_access_token': get_csrf_token(access_token), 
        'csrf_refresh_token': get_csrf_token(refresh_token)  
    })
    
    # Cookies are handled by flask-jwt-extended configuration
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    
    return response

@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)
    return response

@auth_bp.route('/api/auth/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    }), 200
