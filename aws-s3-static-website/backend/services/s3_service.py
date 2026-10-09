import mimetypes
import json

import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from werkzeug.datastructures import FileStorage

from config import Config


class S3ServiceError(Exception):
    pass


class S3Service:
    def __init__(self):
        if not Config.bucket_name:
            raise S3ServiceError("S3_BUCKET_NAME is not configured.")
        self.client = boto3.client("s3", region_name=Config.aws_region)

    def configure_hosting(self) -> None:
        try:
            self.client.put_bucket_website(
                Bucket=Config.bucket_name,
                WebsiteConfiguration={"IndexDocument": {"Suffix": "index.html"}},
            )
            policy = json.dumps({
                "Version": "2012-10-17",
                "Statement": [{
                    "Sid": "PublicReadForWebsite",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{Config.bucket_name}/*",
                }],
            })
            self.client.put_bucket_policy(Bucket=Config.bucket_name, Policy=policy)
        except NoCredentialsError as error:
            raise S3ServiceError("AWS credentials are not configured. Please configure AWS CLI credentials.") from error
        except ClientError as error:
            code = error.response.get("Error", {}).get("Code", "")
            if code in {"AccessDenied", "AllAccessDisabled"}:
                raise S3ServiceError("AWS permission denied. Check the IAM permissions and public access settings.")
            raise S3ServiceError("S3 hosting configuration failed. Check the bucket and AWS region.")

    def upload_file(self, file: FileStorage, key: str) -> None:
        content_type = mimetypes.guess_type(key)[0] or "application/octet-stream"
        try:
            self.client.upload_fileobj(
                file.stream,
                Config.bucket_name,
                key,
                ExtraArgs={"ContentType": content_type},
            )
        except NoCredentialsError as error:
            raise S3ServiceError("AWS credentials are not configured. Please configure AWS CLI credentials.") from error
        except ClientError as error:
            if error.response.get("Error", {}).get("Code") == "AccessDenied":
                raise S3ServiceError("AWS permission denied. Check the IAM permissions for the configured user.")
            raise S3ServiceError("Website deployment failed. Some files could not be uploaded.")

    @staticmethod
    def generate_website_url(deployment_id: str) -> str:
        region = Config.aws_region
        if region in {"us-east-1", "us-west-1", "us-west-2"}:
            endpoint = f"s3-website-{region}.amazonaws.com"
        else:
            endpoint = f"s3-website.{region}.amazonaws.com"
        return f"http://{Config.bucket_name}.{endpoint}/{deployment_id}/"
