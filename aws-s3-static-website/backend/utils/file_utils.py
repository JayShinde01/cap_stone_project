from pathlib import PurePosixPath


def safe_filename(filename: str) -> str:
    normalized = filename.replace("\\", "/").lstrip("/")
    path = PurePosixPath(normalized)
    if not normalized or any(part in {"", ".", ".."} for part in path.parts):
        raise ValueError("Invalid file path.")
    return str(path)
