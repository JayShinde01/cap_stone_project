from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.exceptions import RequestEntityTooLarge

from config import Config
from services.deployment_service import DeploymentError, DeploymentService
from utils.validation import ValidationError, validate_uploads

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "frontend"

app = Flask(__name__, static_folder=str(FRONTEND), static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = Config.max_upload_size_bytes
deployment_service = DeploymentService()


@app.after_request
def allow_local_frontend(response):
    """Allow the optional file:// frontend to call the local development API."""
    origin = request.headers.get("Origin")
    if origin == "null" or origin == "http://localhost:5500" or origin == "http://127.0.0.1:5500":
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/api/<path:_path>", methods=["OPTIONS"])
def api_options(_path):
    return "", 204


@app.errorhandler(RequestEntityTooLarge)
def handle_too_large(_error):
    return jsonify({"success": False, "message": f"Upload exceeds {Config.max_upload_size_mb} MB."}), 413


@app.get("/")
def index():
    return send_from_directory(FRONTEND, "index.html")


@app.get("/api/deployments")
def deployments():
    return jsonify(deployment_service.list_deployments())


@app.post("/api/deploy")
def deploy():
    try:
        files = [file for file in request.files.getlist("files") if file.filename]
        validated_files, name = validate_uploads(files)
        deployment = deployment_service.deploy(validated_files, name)
        return jsonify({"success": True, **deployment}), 201
    except ValidationError as error:
        return jsonify({"success": False, "message": str(error)}), 400
    except DeploymentError as error:
        return jsonify({"success": False, "message": str(error)}), 502
    except Exception:
        app.logger.exception("Unexpected deployment error")
        return jsonify({"success": False, "message": "Website deployment failed. Please try again."}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
