import face_recognition
import numpy as np
import json
import os
from PIL import Image, ImageDraw, ImageFont

# Load known embeddings from db.json
with open("db.json", "r") as f:
    student_db = json.load(f)

known_embeddings = [np.array(student['embedding']) for student in student_db]
known_ids = [student['roll_number'] for student in student_db]

# Ensure output directory exists
output_dir = "output"
os.makedirs(output_dir, exist_ok=True)

# Load default font
font = ImageFont.load_default()

# Process classroom images 1.jpg to 4.jpg
for img_index in range(1, 9):
    image_path = f"testing/{img_index}.jpg"
    input_image = face_recognition.load_image_file(image_path)

    face_locations = face_recognition.face_locations(input_image)
    face_encodings = face_recognition.face_encodings(input_image, face_locations)

    # Convert image to PIL format for drawing
    pil_image = Image.fromarray(input_image)
    draw = ImageDraw.Draw(pil_image)

    for i, (face_encoding, face_location) in enumerate(zip(face_encodings, face_locations)):
        matches = face_recognition.compare_faces(known_embeddings, face_encoding, tolerance=0.5)
        distances = face_recognition.face_distance(known_embeddings, face_encoding)

        best_match_index = np.argmin(distances)

        top, right, bottom, left = face_location

        if matches[best_match_index]:
            matched_id = known_ids[best_match_index]
            label = f"{matched_id}"
        else:
            label = "Unknown"

        # Draw rectangle around the face
        draw.rectangle(((left, top), (right, bottom)), outline=(0, 255, 0), width=3)

        # Calculate text size using textbbox (Pillow ≥10)
        bbox = draw.textbbox((0, 0), label, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # Draw background rectangle for label
        draw.rectangle(
            [(left, bottom), (left + text_width + 6, bottom + text_height + 6)],
            fill=(0, 255, 0)
        )

        # Draw text label
        draw.text((left + 3, bottom + 3), label, fill=(0, 0, 0), font=font)

        print(f"Image {img_index}.jpg - Face {i+1}: {label}")

    # Save annotated image
    output_path = os.path.join(output_dir, f"annotated_{img_index}.jpg")
    pil_image.save(output_path)

print("✅ All classroom images processed and saved in 'output/'")
