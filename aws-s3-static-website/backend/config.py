import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    aws_region = os.getenv("AWS_REGION", "ap-south-1")
    bucket_name = os.getenv("S3_BUCKET_NAME", "")
    max_upload_size_mb = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
    max_upload_size_bytes = max_upload_size_mb * 1024 * 1024
