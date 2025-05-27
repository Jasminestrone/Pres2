from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import torch

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the YOLO model
model = YOLO("runs/detect/train15/weights/best.pt")

@app.route('/process', methods=['POST'])
def process_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
            
        # Here you can add your text processing logic
        # For now, we'll just return the text as is
        processed_text = text
        
        return jsonify({'processedText': processed_text})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000) 