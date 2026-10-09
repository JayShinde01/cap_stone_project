import urllib.parse
from datetime import datetime, timezone


def lambda_handler(event, context):

    print("=" * 60)
    print("S3 IMAGE UPLOAD DETECTED")
    print("=" * 60)

    for record in event["Records"]:

        # Get bucket name
        bucket_name = record["s3"]["bucket"]["name"]

        # Get image/object name
        image_name = urllib.parse.unquote_plus(
            record["s3"]["object"]["key"]
        )

        # Get image size in bytes
        image_size = record["s3"]["object"]["size"]

        # Convert size to KB / MB
        image_size_kb = image_size / 1024
        image_size_mb = image_size / (1024 * 1024)

        # Get upload time from S3 event
        upload_time = record["eventTime"]

        # Event type
        event_name = record["eventName"]

        print(f"Bucket Name : {bucket_name}")
        print(f"Image Name  : {image_name}")
        print(f"Image Size  : {image_size} bytes")
        print(f"Image Size  : {image_size_kb:.2f} KB")
        print(f"Image Size  : {image_size_mb:.2f} MB")
        print(f"Upload Time : {upload_time}")
        print(f"Event       : {event_name}")

        print("=" * 60)

    return {
        "statusCode": 200,
        "message": "Image details logged successfully"
    }