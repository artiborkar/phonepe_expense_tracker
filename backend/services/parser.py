"""Transaction parser for text and CSV formats with fine-grained error reporting."""
import logging
from pathlib import Path
from backend.models.transaction import ParsingError, Transaction
from backend.services.categorizer import CategorizationService
from backend.utils.decorators import timer
from backend.utils.file_handler import read_text_file

logger = logging.getLogger("PhonePeTracker")


class TransactionParser:
    def __init__(self, categorizer: CategorizationService | None = None):
        self.categorizer = categorizer or CategorizationService()

    @timer
    def parse_from_file(self, file_path: Path | str) -> tuple[list[Transaction], list[ParsingError]]:
        """Reads and parses transactions directly from a file path."""
        raw_lines = read_text_file(file_path)
        return self.parse_lines(raw_lines)

    @timer
    def parse_from_text(self, text_content: str) -> tuple[list[Transaction], list[ParsingError]]:
        """Parses transactions from a multi-line raw text string."""
        raw_lines = text_content.splitlines()
        return self.parse_lines(raw_lines)

    def parse_lines(self, lines: list[str]) -> tuple[list[Transaction], list[ParsingError]]:
        """Parses a list of raw string lines into Transactions and ParsingErrors."""
        transactions: list[Transaction] = []
        errors: list[ParsingError] = []
        txn_id = 1

        for line_number, raw_line in enumerate(lines, start=1):
            line = raw_line.strip()

            # Skip empty lines or commented lines
            if not line or line.startswith("#"):
                continue

            # Check if this is a header line (e.g., "date,merchant,amount")
            lower_line = line.lower()
            if "date" in lower_line and ("merchant" in lower_line or "amount" in lower_line):
                continue

            parts = [p.strip() for p in line.split(",")]

            if len(parts) < 3:
                reason = f"Expected 3 comma-separated values (Date, Merchant, Amount), but found {len(parts)}"
                errors.append(ParsingError(line_number=line_number, raw_content=line, reason=reason))
                logger.warning(f"Line {line_number} skipped: {reason}")
                continue

            date_str = parts[0]
            merchant_str = parts[1]
            amount_str = parts[2]

            # Validate merchant
            if not merchant_str:
                reason = "Merchant name cannot be empty"
                errors.append(ParsingError(line_number=line_number, raw_content=line, reason=reason))
                continue

            # Validate and parse amount
            try:
                # Remove currency symbols if present (₹, $, Rs)
                clean_amount = amount_str.replace("₹", "").replace("$", "").replace("Rs.", "").replace("Rs", "").strip()
                amount = float(clean_amount)
                if amount < 0:
                    reason = f"Negative amount ({amount}) is not permitted"
                    errors.append(ParsingError(line_number=line_number, raw_content=line, reason=reason))
                    continue
            except ValueError:
                reason = f"Invalid numeric amount value: '{amount_str}'"
                errors.append(ParsingError(line_number=line_number, raw_content=line, reason=reason))
                logger.warning(f"Line {line_number} skipped: {reason}")
                continue

            # Parse month and year from date string (e.g. 2026-08-01)
            month = 0
            year = 2026
            date_parts = date_str.split("-")
            if len(date_parts) >= 2:
                try:
                    year = int(date_parts[0])
                    month = int(date_parts[1])
                except ValueError:
                    pass

            # Optional 4th column for explicit category, else auto-categorize
            if len(parts) >= 4 and parts[3]:
                category = parts[3]
            else:
                category = self.categorizer.get_category(merchant_str)

            txn = Transaction(
                id=txn_id,
                date=date_str,
                merchant=merchant_str,
                amount=amount,
                category=category,
                month=month,
                year=year
            )
            transactions.append(txn)
            txn_id += 1

        return transactions, errors
