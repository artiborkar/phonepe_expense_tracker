"""Safe File I/O operations for PhonePe Expense Tracker."""
import json
from pathlib import Path
from typing import Any


def read_text_file(file_path: Path | str) -> list[str]:
    """Reads all lines from a text file safely with utf-8 encoding."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.readlines()


def write_json_file(data: Any, file_path: Path | str) -> None:
    """Writes serializable data to a JSON file."""
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


def read_json_file(file_path: Path | str) -> Any:
    """Reads JSON data from file."""
    path = Path(file_path)
    if not path.exists():
        return None

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
