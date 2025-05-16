from ultralytics import YOLO

# Load a model (YOLOv8n is the smallest; you can also try yolov8s, yolov8m, etc.)
model = YOLO("yolov8n.pt")  # or yolov8s.pt, yolov8m.pt, etc.

# Train the model
model.train(
    data="/Users/gabemurray/Documents/GitHub/Pres2/TensorFlowTraining/Data/data.yaml",  # path to your dataset YAML (Roboflow should generate this)
    epochs=50,
    imgsz=640,
    batch=16
)
