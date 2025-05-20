import os

# Optional: Prevent memory fragmentation on CUDA
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

import torch
from ultralytics import YOLO
import torchvision
from torchvision.ops import nms


def main():
    print(f"Torchvision version: {torchvision.__version__}")
    print("CUDA Available:", torch.cuda.is_available())
    if torch.cuda.is_available():
        print("GPU:", torch.cuda.get_device_name(0))

    # 1) Load a YOLO checkpoint
    model = YOLO("yolo11s.pt")

    # 2) Clear cache just in case
    torch.cuda.empty_cache()

    # 3) Train model with adjusted settings
    model.train(
        data="TensorFlowTraining/Data/data.yaml",
        epochs=140,
        imgsz=1471,     #  Lowered from 1472 to reduce memory usage
        batch=8,       #  Lowered batch size to fit within 8GB
    )

    # 4) Export the trained model
    export_path = model.export(
        format="onnx",
        product="Exports",
        name="yolo11v1",
        imgsz=1471,
        device=0,
        dynamic=False,
        half=False,
        int8=False
    )

    print(f"✅ Model exported to: {export_path}")


# ✅ Required for Windows multiprocessing!
if __name__ == "__main__":
    main()
