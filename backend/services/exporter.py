"""Export service to generate CSV and JSON reports."""
import csv
from pathlib import Path
from backend.models.summary import ExpenseSummary
from backend.utils.file_handler import write_json_file


class ExportService:
    @staticmethod
    def export_csv(summary: ExpenseSummary, output_path: Path | str) -> str:
        """Exports filtered transactions and category breakdown to CSV format."""
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)

            # Summary Header
            writer.writerow(["PHONEPE EXPENSE ANALYSIS REPORT"])
            writer.writerow(["Selected Months", ", ".join(summary.month_names)])
            writer.writerow(["Total Spent (INR)", f"{summary.total_spent:.2f}"])
            writer.writerow(["Budget Limit (INR)", f"{summary.budget_limit:.2f}"])
            writer.writerow(["Budget Status", "OVER BUDGET" if summary.is_over_budget else "WITHIN BUDGET"])
            writer.writerow([])

            # Category Breakdown
            writer.writerow(["CATEGORY BREAKDOWN"])
            writer.writerow(["Category", "Amount (INR)", "Percentage (%)", "Transactions Count"])
            for cat in summary.categories:
                writer.writerow([cat.category, f"{cat.amount:.2f}", f"{cat.percentage:.1f}%", cat.transaction_count])
            writer.writerow([])

            # Detailed Transactions
            writer.writerow(["TRANSACTION DETAILS"])
            writer.writerow(["ID", "Date", "Merchant", "Category", "Amount (INR)"])
            for txn in summary.transactions:
                writer.writerow([txn.id, txn.date, txn.merchant, txn.category, f"{txn.amount:.2f}"])

        return str(path.resolve())

    @staticmethod
    def export_json(summary: ExpenseSummary, output_path: Path | str) -> str:
        """Exports summary data as JSON."""
        path = Path(output_path)
        write_json_file(summary.to_dict(), path)
        return str(path.resolve())
