# FaceRecognizer AI Service

A FastAPI microservice for facial embedding generation and attendance verification.

## Start

```sh
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose -f docker-compose.prod.yml up --build
```

## Endpoints

### POST /generate-embeddings
- Input: List of student images
- Output: List of {filename, embedding}

### POST /verify-attendance
- Input: List of test images + known embeddings (JSON)
- Output: Matched roll numbers and annotated image (base64)

## Deployment

- Push to GitHub (monorepo)
- Auto-deploy via Render using `render.yaml`
