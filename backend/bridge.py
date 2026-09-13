"""PyWebView RPC Bridge connecting Python backend with JavaScript frontend."""
import logging
import os
from pathlib import Path
from typing import Any
from backend.config.settings import BUDGET_LIMIT, DATA_FILE_PATH, PROJECT_ROOT
from backend.services.exporter import ExportService
from backend.services.tracker import ExpenseTrackerService

logger = logging.getLogger("PhonePeTracker")


class DesktopBridge:
    def __init__(self, service: ExpenseTrackerService | None = None):
        self.service = service or ExpenseTrackerService()
        self._window: Any = None
        self._last_selected_months: list[int] = []

    def set_window(self, window: Any) -> None:
        """Attaches active pywebview window reference."""
        self._window = window

    def load_default_data(self) -> dict[str, Any]:
        """Loads default sample transaction file if available."""
        try:
            if DATA_FILE_PATH.exists():
                self.service.load_data(file_path=DATA_FILE_PATH)
                summary = self.service.generate_summary(months=[8])
                self._last_selected_months = [8]
                return {"status": "success", "data": summary.to_dict()}
            else:
                summary = self.service.generate_summary()
                return {"status": "success", "data": summary.to_dict()}
        except Exception as e:
            logger.error(f"Error loading default data: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}

    def open_file_dialog(self) -> dict[str, Any]:
        """Opens native Windows file dialog to pick a transaction file."""
        if not self._window:
            return {"status": "error", "message": "Window instance not initialized"}

        try:
            dialog_type = getattr(getattr(webview, 'FileDialog', None), 'OPEN', getattr(webview, 'OPEN_DIALOG', 10))
            result = self._window.create_file_dialog(
                dialog_type,
                allow_multiple=False,
                file_types=file_types
            )

            if result and len(result) > 0:
                selected_path = result[0]
                return self.process_file(selected_path)
            else:
                return {"status": "cancelled", "message": "No file chosen"}
        except Exception as e:
            logger.error(f"Error in file dialog: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}

    def process_file(self, file_path: str) -> dict[str, Any]:
        """Processes transaction file from disk path."""
        try:
            path = Path(file_path)
            if not path.exists():
                return {"status": "error", "message": f"File does not exist: {file_path}"}

            self.service.load_data(file_path=path)
            # Default to month 8 or all detected months
            summary = self.service.generate_summary(months=[8])
            self._last_selected_months = [8]
            return {
                "status": "success",
                "file_name": path.name,
                "file_path": str(path.resolve()),
                "data": summary.to_dict()
            }
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}

    def process_content(self, content: str, file_name: str = "uploaded_file.txt") -> dict[str, Any]:
        """Processes raw text content dragged or pasted into the frontend."""
        try:
            if not content or not content.strip():
                return {"status": "error", "message": "File content is empty"}

            self.service.load_data(text_content=content)
            # Default to month 8 or all
            summary = self.service.generate_summary(months=[8])
            self._last_selected_months = [8]
            return {
                "status": "success",
                "file_name": file_name,
                "data": summary.to_dict()
            }
        except Exception as e:
            logger.error(f"Error processing text content: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}

    def filter_analytics(self, months: list[int] | None = None, budget_limit: float | None = None) -> dict[str, Any]:
        """Filters analytics by month(s) and recalculates metrics."""
        try:
            self._last_selected_months = months or []
            summary = self.service.generate_summary(months=months, budget_limit=budget_limit)
            return {"status": "success", "data": summary.to_dict()}
        except Exception as e:
            logger.error(f"Error filtering analytics: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}

    def update_budget(self, budget_limit: float) -> dict[str, Any]:
        """Updates user's monthly budget limit."""
        try:
            if budget_limit <= 0:
                return {"status": "error", "message": "Budget limit must be greater than 0"}

            self.service.set_budget_limit(budget_limit)
            summary = self.service.generate_summary(months=self._last_selected_months, budget_limit=budget_limit)
            return {"status": "success", "new_budget": budget_limit, "data": summary.to_dict()}
        except Exception as e:
            logger.error(f"Error updating budget: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}

    def export_report(self, format_type: str = "csv", months: list[int] | None = None) -> dict[str, Any]:
        """Exports analytics report to user's desired location."""
        try:
            selected_months = months if months is not None else self._last_selected_months
            summary = self.service.generate_summary(months=selected_months)

            default_name = f"PhonePe_Expense_Report_{'_'.join(str(m) for m in summary.selected_months) if summary.selected_months else 'All'}.{format_type}"

            save_path = None
            if self._window:
                import webview
                file_types = (
                    "CSV (*.csv)" if format_type == "csv" else "JSON (*.json)",
                    "All files (*.*)"
                )
                res = self._window.create_file_dialog(
                    webview.SAVE_DIALOG,
                    save_filename=default_name,
                    file_types=file_types
                )
                if res:
                    save_path = res if isinstance(res, str) else res[0]

            if not save_path:
                export_dir = PROJECT_ROOT / "exports"
                export_dir.mkdir(parents=True, exist_ok=True)
                save_path = str((export_dir / default_name).resolve())

            if format_type.lower() == "json":
                out = ExportService.export_json(summary, save_path)
            else:
                out = ExportService.export_csv(summary, save_path)

            return {"status": "success", "saved_path": out, "message": f"Report exported to {out}"}
        except Exception as e:
            logger.error(f"Error exporting report: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}
