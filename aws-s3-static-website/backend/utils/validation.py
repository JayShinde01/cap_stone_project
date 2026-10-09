from pathlib import PurePosixPath

from werkzeug.datastructures import FileStorage

from utils.file_utils import safe_filename


class ValidationError(Exception):
    pass


def validate_uploads(files: list[FileStorage]) -> tuple[list[FileStorage], str]:
    if not files:
        raise ValidationError("The selected folder contains no files.")
    clean_paths = []
    for file in files:
        try:
            clean_paths.append(safe_filename(file.filename))
        except ValueError as error:
            raise ValidationError("One or more uploaded filenames are invalid.") from error
    if not any(PurePosixPath(path).name.lower() == "index.html" for path in clean_paths):
        raise ValidationError("index.html is required.")
    top_level = PurePosixPath(clean_paths[0]).parts[0]
    name = top_level or "website"
    return files, name
