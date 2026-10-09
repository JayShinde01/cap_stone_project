from datetime import datetime, timezone
from pathlib import PurePosixPath
from secrets import token_hex

from werkzeug.datastructures import FileStorage

from config import Config
from services.s3_service import S3Service, S3ServiceError
from utils.file_utils import safe_filename
from utils.history import DeploymentHistory


class DeploymentError(Exception):
    pass


class DeploymentService:
    def __init__(self):
        self.history = DeploymentHistory()

    def deploy(self, files: list[FileStorage], name: str) -> dict:
        deployment_id = f"site-{token_hex(3)}"
        try:
            s3 = S3Service()
            s3.configure_hosting()
            first_parts = safe_filename(files[0].filename).split("/")
            folder_prefix = first_parts[0] if len(first_parts) > 1 else ""
            for file in files:
                relative_path = safe_filename(file.filename)
                parts = relative_path.split("/")
                if folder_prefix and parts[0] == folder_prefix:
                    relative_path = "/".join(parts[1:])
                key = str(PurePosixPath(deployment_id) / relative_path)
                s3.upload_file(file, key)
            url = s3.generate_website_url(deployment_id)
        except S3ServiceError as error:
            raise DeploymentError(str(error)) from error

        deployment = {
            "id": deployment_id,
            "name": name,
            "fileCount": len(files),
            "url": url,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        self.history.add(deployment)
        return {
            "deploymentId": deployment_id,
            "fileCount": len(files),
            "url": url,
            "message": "Website deployed successfully",
        }

    def list_deployments(self) -> list[dict]:
        deployments = self.history.list()
        for deployment in deployments:
            deployment["url"] = S3Service.generate_website_url(deployment["id"])
        return deployments
