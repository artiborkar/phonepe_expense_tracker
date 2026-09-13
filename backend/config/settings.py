"""Application configuration settings for PhonePe Expense Tracker."""
import os
from pathlib import Path

import sys

# Project root directory (handles PyInstaller bundle vs development mode)
if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
    PROJECT_ROOT = Path(sys._MEIPASS)
else:
    PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def load_env_file(env_path: Path) -> None:
    """Load key-value pairs from .env file into os.environ."""
    if not env_path.exists():
        return

    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ.setdefault(key.strip(), value.strip())
    except Exception:
        pass


# Load environment variables
_env_path = PROJECT_ROOT / ".env"
load_env_file(_env_path)

# Automatically sync brand logo from root image.png to frontend assets
_src_logo = PROJECT_ROOT / "image.png"
_assets_dir = PROJECT_ROOT / "frontend" / "assets"
if _src_logo.exists():
    try:
        _assets_dir.mkdir(parents=True, exist_ok=True)
        import shutil
        shutil.copy2(_src_logo, _assets_dir / "phonepe-logo.png")
        shutil.copy2(_src_logo, _assets_dir / "logo.png")
    except Exception:
        pass

# App Configuration
BUDGET_LIMIT: float = float(os.getenv("BUDGET_LIMIT", "10000.0"))
DATA_FILE_PATH: Path = PROJECT_ROOT / os.getenv("DATA_FILE_PATH", "data/transactions.txt")
OUTPUT_JSON_PATH: Path = PROJECT_ROOT / os.getenv("OUTPUT_JSON_PATH", "data/summary.json")
LOG_FILE_PATH: Path = PROJECT_ROOT / os.getenv("LOG_FILE_PATH", "logs/tracker.log")

# Standardized Category mapping keywords in prioritized matching order
CATEGORY_RULES: dict[str, list[str]] = {
    "Food": ["swiggy", "zomato", "canteen", "tea", "restaurant", "lunch", "dinner", "breakfast", "snacks", "cafe"],
    "Travel": ["uber", "ola", "rapido", "metro", "petrol", "hpcl", "bpcl", "iocl", "indian oil", "fuel", "taxi", "commute", "pass"],
    "Shopping": ["amazon", "flipkart", "myntra", "shoes", "fashion", "order", "clothing", "kindle", "gift"],
    "Bills": ["bescom", "mseb", "electricity", "water", "wifi", "airtel", "jio", "broadband", "recharge", "lpg", "gas", "bill", "internet", "ticket"],
    "Health": ["pharmacy", "medical", "doctor", "clinic", "hospital", "consultation", "vitamin", "gym", "yoga"],
    "Store": ["dmart", "demart", "grocery", "supermarket", "store"],
    "Salon": ["salon", "salone", "haircut", "spa", "grooming"],
    "Education": ["course", "books", "udemy", "coursera", "college", "tuition", "school"],
    "Farming": ["supplies", "fertilizer", "seeds", "farming"],
    "Electronics": ["earphones", "headphone", "mobile", "gadget", "bluetooth", "laptop", "charger"]
}

# Category colors for UI consistency
CATEGORY_COLORS: dict[str, str] = {
    "Food": "#F59E0B",        # Amber
    "Travel": "#8B5CF6",      # Purple
    "Shopping": "#EC4899",    # Pink
    "Bills": "#3B82F6",       # Blue
    "Health": "#10B981",      # Emerald Green
    "Store": "#14B8A6",       # Teal
    "Salon": "#F43F5E",       # Rose
    "Education": "#06B6D4",   # Cyan
    "Farming": "#84CC16",     # Lime Green
    "Electronics": "#6366F1", # Indigo
    "Other": "#94A3B8"        # Slate Gray
}
