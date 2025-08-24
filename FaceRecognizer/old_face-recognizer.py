from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import face_recognition
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import json
from utils.storage import upload_to_s3, delete_from_s3
from utils.config import load_env
import time

app = FastAPI()
load_env()  # Load env vars from .env

@app.get("/")
async def root():
    return {"message": "Welcome to Face Recognition API"}


@app.post("/generate-embeddings")
async def generate_embeddings(files: List[UploadFile] = File(...)):
    response = []

    for file in files:
        contents = await file.read()
        image = face_recognition.load_image_file(io.BytesIO(contents))
        encodings = face_recognition.face_encodings(image)

        if not encodings:
            continue

        embedding = encodings[0].tolist()
        response.append({
            "image": file.filename,
            "embedding": embedding
        })

    return {"embeddings": response}


@app.post("/verify-attendance")
async def verify_attendance(
    images: List[UploadFile] = File(...),
    studentEmbeddings: str = Form(...),
    subjectId: str = Form(...),
    lectureId: str = Form(...)
):
    start = time.time()
    studentEmbeddings = json.loads(studentEmbeddings)

    embeddings_map = {}
    for student in studentEmbeddings:
        rollNumber = student['rollNumber']
        if len(student['embeddings']) > 0:
            embeddings_map[rollNumber] = {
                "images": [item['image'] for item in student['embeddings']],
                "values": [np.array(item['embedding']) for item in student['embeddings']]
            }

    font = ImageFont.load_default()
    results = []

    for file in images:
        contents = await file.read()
        image_np = face_recognition.load_image_file(io.BytesIO(contents))
        locations = face_recognition.face_locations(image_np)
        encodings = face_recognition.face_encodings(image_np, locations)

        pil_img = Image.fromarray(image_np)
        draw = ImageDraw.Draw(pil_img)
        matched_ids = []

        for encoding, location in zip(encodings, locations):
            best_match = None
            best_distance = float("inf")

            # Iterate through each student's embeddings
            for rollNumber, data in embeddings_map.items():
                matches = face_recognition.compare_faces(data['values'], encoding, tolerance=0.5)
                distances = face_recognition.face_distance(data['values'], encoding)
                min_distance = np.min(distances)

                # Update best match if current match is closer
                if matches[np.argmin(distances)] and min_distance < best_distance:
                    best_match = rollNumber
                    best_distance = min_distance

            # Draw bounding box and label
            top, right, bottom, left = location
            label = best_match if best_match else "Unknown"
            matched_ids.append(label)

            # 🟥 Red for Unknown, 🟩 Green for known
            box_color = (255, 0, 0) if label == "Unknown" else (0, 255, 0)
            draw.rectangle(((left, top), (right, bottom)), outline=box_color, width=3)

            bbox = draw.textbbox((0, 0), label, font=font)
            draw.rectangle(
                [(left, bottom), (left + bbox[2] + 6, bottom + bbox[3] + 6)],
                fill=box_color
            )
            draw.text((left + 3, bottom + 3), label, fill=(0, 0, 0), font=font)

        # Save annotated image to buffer
        buf = io.BytesIO()
        pil_img.save(buf, format='JPEG')
        image_bytes = buf.getvalue()

        # Upload annotated image to S3
        timestamped_name = f"{file.filename}"
        path = f"lectures/{subjectId}/{lectureId}/annotated_images"

        try:
            s3_url, s3_key = upload_to_s3(image_bytes, timestamped_name, path)
            # s3_url, s3_key = "", ""
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

        try:
            results.append({
                "fileName": file.filename,
                "fileSize": len(image_bytes),
                "matchedIds": matched_ids,
                "url": s3_url,
                "key": s3_key
            })
        except Exception as e:
            delete_from_s3(s3_key)
            raise HTTPException(status_code=500, detail=f"Post-upload failure: {str(e)}")

    print(f"Time taken: {time.time() - start}")
    return JSONResponse(content={"results": results})
