
import boto3
import os
import mimetypes

bucket = os.getenv("AWS_BUCKET_NAME")
region = os.getenv("AWS_REGION")

s3 = boto3.client(
    "s3",
    region_name=region,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

def upload_to_s3(image_bytes: bytes, filename: str, filepath: str) -> tuple[str, str]:
    # lectures/<subject_id>/<lec_id>/annotated_images/<timestamp>.jpg
    key = f"{filepath}/{filename}"

    # Get content type based on file extension
    content_type, _ = mimetypes.guess_type(filename)
    content_type = content_type or "application/octet-stream"  # Fallback
    
    # Upload to S3
    s3.put_object(Bucket=bucket, Key=key, Body=image_bytes, ContentType=content_type)

    url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
    return url, key

def delete_from_s3(key: str):
    s3.delete_object(Bucket=bucket, Key=key)

def download_from_s3(key: str) -> bytes:
    """
    Downloads an object from S3 and returns its content as bytes.
    """
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        return response["Body"].read()
    except s3.exceptions.NoSuchKey:
        raise FileNotFoundError(f"S3 object with key '{key}' not found.")
