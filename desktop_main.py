"""PhonePe Expense Tracker - Desktop Application Entry Point."""
import os
import sys
from pathlib import Path

# Handle PyInstaller frozen bundle vs regular script execution
if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
    PROJECT_ROOT = Path(sys._MEIPASS)
else:
    PROJECT_ROOT = Path(__file__).resolve().parent

sys.path.insert(0, str(PROJECT_ROOT))

import webview
from backend.bridge import DesktopBridge
from backend.utils.logger import setup_logger

logger = setup_logger()


def main():
    logger.info("Initializing PhonePe Expense Intelligence Desktop Application...")

    # Initialize Backend RPC Bridge
    bridge = DesktopBridge()

    # Path to frontend HTML entry
    frontend_path = PROJECT_ROOT / "frontend" / "index.html"
    if not frontend_path.exists():
        logger.error(f"Frontend entry file not found at: {frontend_path}")
        print(f"Error: Frontend index.html not found at {frontend_path}")
        return

    # Create Native Desktop Window with PhonePe Dark Theme
    window = webview.create_window(
        title="PhonePe Expense Intelligence",
        url=str(frontend_path.resolve()),
        js_api=bridge,
        width=1340,
        height=900,
        min_size=(1000, 680),
        background_color="#080B11",
        easy_drag=True
    )

    # Attach window instance to bridge for native file dialogs
    bridge.set_window(window)

    # Launch PyWebView application with Edge Chromium / WebView2 engine
    logger.info("Launching desktop window (Edge Chromium WebView2)...")
    webview.start(gui="edgechromium", http_server=True, debug=False)


if __name__ == "__main__":
    main()
