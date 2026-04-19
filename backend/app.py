import os
import datetime
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import jwt
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes and origins

# Get environment variables
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/healthifyai')
JWT_SECRET = os.environ.get('JWT_SECRET', 'super-secret-key-change-in-prod')
COLAB_URL = os.environ.get('COLAB_URL', 'https://unifier-sleek-cornhusk.ngrok-free.dev/predict')

# Setup MongoDB
try:
    client = MongoClient(MONGO_URI)
    db = client.get_default_database() if client.get_default_database().name else client['healthifyai']
    users_collection = db['users']
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Authentication Decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Parse from Header: 'Authorization: Bearer <token>'
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # Decode JWT
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = users_collection.find_one({'username': data['username']})
            if not current_user:
                return jsonify({'message': 'Invalid token user'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password required'}), 400
        
    username = data.get('username')
    password = data.get('password')

    if users_collection.find_one({'username': username}):
        return jsonify({'message': 'User already exists'}), 409

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    new_user = {
        'username': username,
        'password': hashed_password.decode('utf-8')
    }
    
    users_collection.insert_one(new_user)
    
    return jsonify({'message': 'registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Could not verify', 'error': 'Missing credentials'}), 401

    user = users_collection.find_one({'username': data.get('username')})

    if not user:
        return jsonify({'message': 'User not found'}), 401

    if bcrypt.checkpw(data.get('password').encode('utf-8'), user['password'].encode('utf-8')):
        # Generate JWT token valid for 24 hours
        token = jwt.encode({
            'username': user['username'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, JWT_SECRET, algorithm="HS256")

        return jsonify({'token': token})

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/predict', methods=['POST'])
@token_required
def predict(current_user):
    data = request.json
    
    if not data or 'image' not in data:
        return jsonify({'message': 'Image data is required'}), 400

    colab_payload = {'image': data['image']}
    
    try:
        # Relay to Colab server
        response = requests.post(COLAB_URL, json=colab_payload, timeout=60)
        
        # Attempt to parse json
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({'message': f'Error from ML service: {response.status_code}', 'details': response.text}), response.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({'message': 'Failed to reach ML service', 'error': str(e)}), 500

if __name__ == '__main__':
    # Used for local development
    app.run(host='0.0.0.0', port=5000, debug=True)
