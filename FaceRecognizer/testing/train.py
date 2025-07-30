import face_recognition
import json
import os

# Path to the dataset and database file
dataset_folder = "dataset"
db_file = "db.json"

# Load existing data if db.json exists
if os.path.exists(db_file):
    with open(db_file, "r") as f:
        student_db = json.load(f)
else:
    student_db = []

# Range of student image IDs
start_id = 1
end_id = 135

for i in range(start_id, end_id + 1):
    roll_number = f"24CI2110{i:03d}"
    image_path = os.path.join(dataset_folder, f"{roll_number}.jpg")
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        continue

    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)

    if len(encodings) == 0:
        print(f"⚠️ No face found in image: {roll_number}")
        continue

    embedding = encodings[0]
    student_record = {
        "roll_number": roll_number,
        "embedding": embedding.tolist()
    }

    student_db.append(student_record)
    print(f"✅ Processed: {roll_number}")

# Save updated database
with open(db_file, "w") as f:
    json.dump(student_db, f, indent=2)

print("✅ All embeddings saved to db.json")
