
import os
from dotenv import load_dotenv

def load_env():
    load_dotenv()
    os.environ["AWS_ACCESS_KEY_ID"] = os.getenv("AWS_ACCESS_KEY_ID", "")
    os.environ["AWS_SECRET_ACCESS_KEY"] = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    os.environ["AWS_BUCKET_NAME"] = os.getenv("AWS_BUCKET_NAME", "")
    os.environ["AWS_REGION"] = os.getenv("AWS_REGION", "")
