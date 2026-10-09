import json
import threading
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "deployments.json"


class DeploymentHistory:
    _lock = threading.RLock()

    def __init__(self):
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        if not DATA_FILE.exists():
            DATA_FILE.write_text("[]", encoding="utf-8")

    def list(self) -> list[dict]:
        with self._lock:
            try:
                data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
                return data if isinstance(data, list) else []
            except (OSError, json.JSONDecodeError):
                return []

    def add(self, deployment: dict) -> None:
        with self._lock:
            deployments = self.list()
            deployments.insert(0, deployment)
            DATA_FILE.write_text(json.dumps(deployments, indent=2), encoding="utf-8")
