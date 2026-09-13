"""Build script to bundle PhonePe Expense Tracker into a standalone Windows single-file .exe."""
import os
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent


def ensure_icon():
    """Generates an icon file from image.png if possible."""
    icon_path = PROJECT_ROOT / "app_icon.ico"
    png_path = PROJECT_ROOT / "image.png"

    if icon_path.exists():
        return icon_path

    if png_path.exists():
        try:
            from PIL import Image
            img = Image.open(png_path)
            img.save(icon_path, format="ICO", sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])
            print(f"[*] Generated application icon at: {icon_path}")
            return icon_path
        except Exception as e:
            print(f"[*] Note: Icon generation skipped ({e})")

    return None


def build():
    print("\n==========================================")
    print("  Building PhonePe Expense Tracker .exe   ")
    print("      (Single Standalone Executable)      ")
    print("==========================================\n")

    # Automatically use project virtualenv if available
    venv_py = PROJECT_ROOT / ".venv" / "Scripts" / "python.exe"
    python_exec = str(venv_py) if venv_py.exists() else sys.executable

    # Ensure pyinstaller is installed in active environment
    try:
        subprocess.check_call([python_exec, "-m", "PyInstaller", "--version"], stdout=subprocess.DEVNULL)
    except Exception:
        print("[*] Installing required packaging tools...")
        try:
            subprocess.check_call(["uv", "pip", "install", "pyinstaller", "pywebview", "pillow"])
        except Exception:
            subprocess.check_call([python_exec, "-m", "pip", "install", "pyinstaller", "pywebview", "pillow"])

    # Terminate any currently running instance of the exe so PyInstaller can overwrite it
    try:
        subprocess.run(["taskkill", "/F", "/IM", "PhonePeExpenseTracker.exe", "/T"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

    dist_path = PROJECT_ROOT / "dist"
    build_path = PROJECT_ROOT / "build"
    frontend_dir = PROJECT_ROOT / "frontend"
    data_dir = PROJECT_ROOT / "data"

    icon_path = ensure_icon()

    cmd = [
        python_exec,
        "-m",
        "PyInstaller",
        "--name=PhonePeExpenseTracker",
        "--onefile",
        "--windowed",
        "--noconfirm",
        "--clean",
        "--collect-all=webview",
        "--collect-all=clr_loader",
        "--hidden-import=webview",
        "--hidden-import=webview.platforms.winforms",
        "--hidden-import=webview.platforms.edgechromium",
        f"--add-data={frontend_dir};frontend",
        f"--add-data={data_dir};data",
        f"--distpath={dist_path}",
        f"--workpath={build_path}",
    ]

    if icon_path and icon_path.exists():
        cmd.append(f"--icon={icon_path}")

    cmd.append(str(PROJECT_ROOT / "desktop_main.py"))

    print("[*] Running PyInstaller command:")
    print(" ".join(cmd))
    subprocess.check_call(cmd)

    exe_file = dist_path / "PhonePeExpenseTracker.exe"
    print("\n" + "="*50)
    print("[SUCCESS] Standalone Single-File Build Complete!")
    print(f"Executable File: {exe_file}")
    print("You can now share this single .exe file directly with anyone!")
    print("="*50 + "\n")


if __name__ == "__main__":
    build()

