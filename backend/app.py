import os
import uuid
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image
import numpy as np
from dotenv import load_dotenv

# TensorFlow imports
import tensorflow as tf

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['postgresql://plant_disease_db_jznn_user:akzd6fJ0TnGHI8fbObzqVTE7lxHNBChi@dpg-d8ilvebtqb8s73bajs90-a/plant_disease_db_jznn'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# ---------------------------
# Database Models (unchanged)
# ---------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(80), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    image_filename = db.Column(db.String(200), nullable=False)
    disease = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    treatment = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

# ---------------------------
# Load Real Model & JSON files
# ---------------------------
MODEL_PATH = "plant_disease_model.h5"
CLASS_LABELS_PATH = "class_labels.json"
DISEASE_INFO_PATH = "disease_info.json"

# Load model
model = tf.keras.models.load_model(MODEL_PATH)

# Load class labels (list)
with open(CLASS_LABELS_PATH, 'r') as f:
    class_labels = json.load(f)   # e.g., ["Apple___Apple_scab", ...]

# Load disease info (dict: disease_name -> {description, treatment})
with open(DISEASE_INFO_PATH, 'r') as f:
    disease_info = json.load(f)

def preprocess_image(image_file):
    """Open image, resize to model input size, normalize to [0,1], add batch dimension."""
    img = Image.open(image_file).convert('RGB')
    # Model input size? Common for MobileNetV2 is 224x224. Adjust if yours is different.
    # Assume 224x224; if not, change below.
    img = img.resize((128, 128))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def real_predict(image_file):
    """Run model prediction and return disease info."""
    processed = preprocess_image(image_file)
    predictions = model.predict(processed)[0]   # shape (38,)
    idx = np.argmax(predictions)
    confidence = float(predictions[idx])
    disease_name = class_labels[idx]
    
    # Get description and treatment from disease_info
    info = disease_info.get(disease_name, {
        "description": "No description available.",
        "treatment": "Consult a plant specialist."
    })
    
    return {
        "disease": disease_name,
        "confidence": confidence,
        "description": info["description"],
        "treatment": info["treatment"]
    }

# Use real prediction function
PREDICT_FUNC = real_predict

def save_uploaded_image(file):
    filename = str(uuid.uuid4()) + ".jpg"
    os.makedirs("uploads", exist_ok=True)
    file.save(os.path.join("uploads", filename))
    return filename

# ---------------------------
# Routes (unchanged except using PREDICT_FUNC)
# ---------------------------
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('name') or not data.get('password'):
        return jsonify({"msg": "Missing fields"}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Email exists"}), 409
    user = User(email=data['email'], name=data['name'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User created"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not user.check_password(data.get('password')):
        return jsonify({"msg": "Invalid credentials"}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify(access_token=token, user={"id": user.id, "name": user.name, "email": user.email}), 200

@app.route('/api/predict', methods=['POST'])
@jwt_required()
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({"msg": "No image"}), 400
        file = request.files['image']
        filename = save_uploaded_image(file)
        file.seek(0)
        result = PREDICT_FUNC(file)
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        pred = Prediction(
            user_id=user_id,
            image_filename=filename,
            disease=result['disease'],
            confidence=result['confidence'],
            description=result['description'],
            treatment=result['treatment']
        )
        db.session.add(pred)
        db.session.commit()
        return jsonify({
            "disease": result['disease'],
            "confidence": result['confidence'],
            "description": result['description'],
            "treatment": result['treatment'],
            "image_url": f"/uploads/{filename}"
        }), 200
    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({"msg": str(e)}), 500

@app.route('/api/history', methods=['GET'])
@jwt_required()
def history():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    preds = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.timestamp.desc()).limit(50).all()
    return jsonify([{
        "id": p.id,
        "disease": p.disease,
        "confidence": p.confidence,
        "description": p.description,
        "treatment": p.treatment,
        "timestamp": p.timestamp.isoformat(),
        "image_url": f"/uploads/{p.image_filename}"
    } for p in preds]), 200

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
