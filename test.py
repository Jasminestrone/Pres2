from ultralytics import YOLO
import cv2

model = YOLO(r"runs\detect\train15\weights\best.pt")


results = model.predict(source="Pres2_Slides_to_annotate\Screenshot 2025-05-15 at 1.09.04 PM.png")

for result in results:
    boxes = result.boxes  # Bounding boxes
    confidence_scores = boxes.conf  # Confidence scores
    class_ids = boxes.cls  # Class labels

    for i, box in enumerate(boxes):
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        confidence = confidence_scores[i].item()
        class_id = int(class_ids[i].item())
        print(f"Object: {class_id}, Confidence: {confidence:.2f}, Bounding Box: ({x1}, {y1}), ({x2}, {y2})")
        
annotated_frame = results[0].plot()

# Display the annotated image
cv2.imshow("Detection Results", annotated_frame)
cv2.waitKey(0)
cv2.destroyAllWindows()