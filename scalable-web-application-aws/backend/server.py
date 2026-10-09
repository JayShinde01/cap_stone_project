from flask import Flask
import requests

app = Flask(__name__)


def get_metadata(path):
    token = requests.put(
        "http://169.254.169.254/latest/api/token",
        headers={
            "X-aws-ec2-metadata-token-ttl-seconds": "21600"
        },
        timeout=2
    ).text

    response = requests.get(
        f"http://169.254.169.254/latest/meta-data/{path}",
        headers={
            "X-aws-ec2-metadata-token": token
        },
        timeout=2
    )

    return response.text


@app.route("/server-info")
def server_info():
    instance_id = get_metadata("instance-id")
    hostname = get_metadata("hostname")

    return f"Instance ID: {instance_id}<br>Hostname: {hostname}"


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000
    )