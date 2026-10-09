import boto3
import json

from botocore.config import Config


# =========================================================
# S3 CLIENT
# =========================================================

s3 = boto3.client(
    "s3",
    region_name="ap-south-1",
    config=Config(
        signature_version="s3v4",
        s3={
            "addressing_style": "virtual"
        }
    )
)

bucket_name = "jay-boto3-demo-bucket"


# =========================================================
# CREATE BUCKET
# =========================================================

def create_bucket():

    try:

        s3.create_bucket(
            Bucket=bucket_name,
            CreateBucketConfiguration={
                "LocationConstraint": "ap-south-1"
            }
        )

        print("Bucket created successfully!")
        return True

    except Exception as e:

        print(f"Something went wrong: {e}")
        return False


# create_bucket()


# =========================================================
# ENABLE STATIC WEBSITE HOSTING
# =========================================================

def enable_static_website(bucket_name):

    try:

        s3.put_bucket_website(
            Bucket=bucket_name,
            WebsiteConfiguration={
                "IndexDocument": {
                    "Suffix": "index.html"
                }
            }
        )

        print("Static website hosting enabled!")
        return True

    except Exception as e:

        print(f"Website configuration failed: {e}")
        return False


# # =========================================================
# # ALLOW PUBLIC ACCESS
# # =========================================================

def allow_public_access(bucket_name):

    try:

        s3.put_public_access_block(
            Bucket=bucket_name,
            PublicAccessBlockConfiguration={
                "BlockPublicAcls": False,
                "IgnorePublicAcls": False,
                "BlockPublicPolicy": False,
                "RestrictPublicBuckets": False
            }
        )

        print("Public access block configured!")
        return True

    except Exception as e:

        print(f"Public access configuration failed: {e}")
        return False


# # =========================================================
# # BUCKET POLICY
# # =========================================================

def add_bucket_policy(bucket_name):

    try:

        bucket_policy = {
            "Version": "2012-10-17",

            "Statement": [
                {
                    "Sid": "PublicReadGetObject",

                    "Effect": "Allow",

                    "Principal": "*",

                    "Action": "s3:GetObject",

                    "Resource": f"arn:aws:s3:::{bucket_name}/*"
                }
            ]
        }

        s3.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(bucket_policy)
        )

        print("Bucket policy added!")
        return True

    except Exception as e:

        print(f"Bucket policy failed: {e}")
        return False


# =========================================================
# UPLOAD FILE
# =========================================================

def upload_file(
    bucket_name,
    file_path,
    s3_file_name,
    content_type
):

    try:

        s3.upload_file(
            file_path,
            bucket_name,
            s3_file_name,

            ExtraArgs={
                "ContentType": content_type
            }
        )

        print(
            f"File uploaded successfully: {s3_file_name}"
        )

        return True

    except Exception as e:

        print(f"Upload failed: {e}")

        return False


# =========================================================
# GENERATE PRESIGNED URL
# =========================================================

def generate_presigned_url(
    bucket_name,
    s3_file_name,
    expiration=6000
):

    try:

        url = s3.generate_presigned_url(

            "get_object",

            Params={
                "Bucket": bucket_name,
                "Key": s3_file_name
            },

            ExpiresIn=expiration
        )

        print("Presigned URL:")
        print(url)

        return url

    except Exception as e:

        print(
            f"Failed to create Presigned URL: {e}"
        )


# =========================================================
# LIST BUCKETS
# =========================================================

def list_buckets():

    try:

        response = s3.list_buckets()

        print(
            "========== LIST ALL BUCKETS =========="
        )

        for bucket in response["Buckets"]:

            print(
                f"Bucket Name : {bucket['Name']}"
            )

            print(
                f"Created At  : {bucket['CreationDate']}"
            )

            print("--------------------------------")

        return True

    except Exception as e:

        print(
            f"Something went wrong: {e}"
        )

        return False


# =========================================================
# LIST FILES
# =========================================================

def list_files(bucket_name):

    try:

        response = s3.list_objects_v2(
            Bucket=bucket_name
        )

        if "Contents" in response:

            for file in response["Contents"]:

                print(
                    f"File Name : {file['Key']}"
                )

                print(
                    f"Size      : {file['Size']} bytes"
                )

                print(
                    f"Modified  : {file['LastModified']}"
                )

                print(
                    f"Storage   : {file['StorageClass']}"
                )

                print("--------------------------------")

        else:

            print("Bucket is empty")

        return True

    except Exception as e:

        print(
            f"Something went wrong: {e}"
        )

        return False


# =========================================================
# EXECUTE
# =========================================================


# 1. Create bucket
# create_bucket()


# 2. Allow public access
allow_public_access(bucket_name)


# 3. Enable static website hosting
enable_static_website(bucket_name)


# 4. Add bucket policy
add_bucket_policy(bucket_name)


# 5. Upload index.html
upload_file(
    bucket_name=bucket_name,

    file_path="portfolio/index.html",

    s3_file_name="index.html",

    content_type="text/html"
)


# 6. List files
list_files(bucket_name)


# 7. Website URL

website_url = (
    f"http://{bucket_name}"
    f".s3-website.ap-south-1.amazonaws.com"
)

print()
print("======================================")
print("YOUR WEBSITE URL:")
print(website_url)
print("======================================")