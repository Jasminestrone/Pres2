from ultralytics import YOLO

# 1)  load a checkpoint
model = YOLO("yolov11n.pt")

# 2)  train
model.train(
    data="/Users/gabemurray/Documents/GitHub/Pres2/TensorFlowTraining/Data/data.yaml",
    epochs=50,
    imgsz=1471,
    batch=16
)

# 3)  export ––– choose a format you need
export_path = model.export(
    format="onnx",      # ▶ 'onnx', 'engine' (TensorRT), 'openvino', 'tflite',
                        #   'coreml', 'torchscript', 'pb', etc.
    imgsz=1471,         # (optional) fix input size for the exported graph
    dynamic=False,      # True lets ONNX/TensorRT accept any resolution
    half=False,         # set True for FP16 weights (where supported)
    int8=False          # set True for INT8 quantization (TensorRT only)
)

print(f"Model saved to: {export_path}")
