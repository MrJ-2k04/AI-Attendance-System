from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List
import face_recognition
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import json

app = FastAPI()

@app.post("/generate-embeddings")
async def generate_embeddings(files: List[UploadFile] = File(...)):
    """
    Accepts face images and returns facial embeddings.
    """
    response = []

    for file in files:
        contents = await file.read()
        image = face_recognition.load_image_file(io.BytesIO(contents))
        encodings = face_recognition.face_encodings(image)

        if not encodings:
            continue

        embedding = encodings[0].tolist()
        response.append({
            "filename": file.filename,
            "embedding": embedding
        })

    return {"embeddings": response}


@app.post("/verify-attendance")
async def verify_attendance(
    files: List[UploadFile] = File(...),
    known_embeddings_json: str = Form(...)
):
    """
    Accepts classroom images and known embeddings (in JSON).
    Returns matched roll numbers and base64-annotated image.
    """
    known_data = json.loads(known_embeddings_json)
    known_embeddings = [np.array(item['embedding']) for item in known_data]
    known_ids = [item['id'] for item in known_data]
    font = ImageFont.load_default()

    results = []

    for file in files:
        contents = await file.read()
        image_np = face_recognition.load_image_file(io.BytesIO(contents))
        locations = face_recognition.face_locations(image_np)
        encodings = face_recognition.face_encodings(image_np, locations)

        pil_img = Image.fromarray(image_np)
        draw = ImageDraw.Draw(pil_img)
        matched_ids = []

        for encoding, location in zip(encodings, locations):
            matches = face_recognition.compare_faces(known_embeddings, encoding, tolerance=0.5)
            distances = face_recognition.face_distance(known_embeddings, encoding)
            best_match_index = np.argmin(distances)

            top, right, bottom, left = location
            label = "Unknown"

            if matches[best_match_index]:
                label = known_ids[best_match_index]
                matched_ids.append(label)

            draw.rectangle(((left, top), (right, bottom)), outline=(0, 255, 0), width=3)
            bbox = draw.textbbox((0, 0), label, font=font)
            draw.rectangle(
                [(left, bottom), (left + bbox[2] + 6, bottom + bbox[3] + 6)],
                fill=(0, 255, 0)
            )
            draw.text((left + 3, bottom + 3), label, fill=(0, 0, 0), font=font)

        buf = io.BytesIO()
        pil_img.save(buf, format='JPEG')
        img_b64 = base64.b64encode(buf.getvalue()).decode()

        results.append({
            "file": file.filename,
            "matched_ids": matched_ids,
            "annotated_image": img_b64
        })

    return JSONResponse(content={"results": results})
