"""Test suite for desktop bridge and app initialization."""
import io
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.bridge import DesktopBridge
from backend.config.settings import PROJECT_ROOT


def test_frontend_assets_exist():
    frontend_index = PROJECT_ROOT / "frontend" / "index.html"
    assert frontend_index.exists(), f"Missing index.html at {frontend_index}"

    css_theme = PROJECT_ROOT / "frontend" / "css" / "theme.css"
    assert css_theme.exists(), f"Missing theme.css at {css_theme}"

    js_app = PROJECT_ROOT / "frontend" / "js" / "app.js"
    assert js_app.exists(), f"Missing app.js at {js_app}"

    print("[PASS] Frontend desktop static assets verified!")


def test_desktop_bridge_operations():
    bridge = DesktopBridge()

    # Load default data
    res = bridge.load_default_data()
    assert res["status"] == "success"
    assert "data" in res

    # Budget update test
    budget_res = bridge.update_budget(12000.0)
    assert budget_res["status"] == "success"
    assert budget_res["data"]["budget_limit"] == 12000.0

    # Content processing test
    sample_text = "2026-08-01, Swiggy, 450\n2026-08-02, Uber, 200"
    content_res = bridge.process_content(sample_text, "test.txt")
    assert content_res["status"] == "success"
    assert content_res["data"]["total_spent"] == 650.0

    print("[PASS] Desktop Bridge operations verified!")


if __name__ == "__main__":
    print("\n--- Running Desktop App & Assets Tests ---")
    test_frontend_assets_exist()
    test_desktop_bridge_operations()
    print("\n>>> ALL DESKTOP TESTS PASSED! <<<\n")
