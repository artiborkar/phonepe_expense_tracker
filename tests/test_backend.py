"""Automated unit test suite for PhonePe Expense Tracker Backend."""
import io
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.config.settings import BUDGET_LIMIT, DATA_FILE_PATH
from backend.services.categorizer import CategorizationService
from backend.services.parser import TransactionParser
from backend.services.tracker import ExpenseTrackerService
from backend.bridge import DesktopBridge


def test_categorizer():
    cat = CategorizationService()
    assert cat.get_category("Swiggy Instamart") == "Food"
    assert cat.get_category("Uber Ride") == "Travel"
    assert cat.get_category("Amazon Purchase") == "Shopping"
    assert cat.get_category("Electricity Bill Bescom") == "Bills"
    assert cat.get_category("Doctor Consultation") == "Health"
    assert cat.get_category("DMart Supermarket") == "Store"
    assert cat.get_category("Random Merchant XYZ") == "Other"
    print("[PASS] Categorizer tests passed!")


def test_parser_and_errors():
    parser = TransactionParser()
    sample_text = """
    2026-08-01, Swiggy, 350
    # Comment line
    2026-08-02, Uber Ride, 180
    2026-08-09, Invalid Line Without Comma
    2026-08-10, Tea Stall, 40
    2026-08-27,
    """
    txns, errors = parser.parse_from_text(sample_text)
    assert len(txns) == 3, f"Expected 3 valid transactions, got {len(txns)}"
    assert len(errors) == 2, f"Expected 2 parsing errors, got {len(errors)}"
    assert errors[0].line_number == 5
    assert errors[1].line_number == 7
    print("[PASS] Parser and error tracking tests passed!")


def test_expense_tracker_service():
    service = ExpenseTrackerService(budget_limit=10000.0)
    txns, errors = service.load_data(file_path=DATA_FILE_PATH)
    assert len(txns) > 40, f"Expected >40 transactions, got {len(txns)}"
    assert len(errors) == 2, f"Expected 2 skipped lines, got {len(errors)}"

    # August Summary
    aug_summary = service.generate_summary(months=[8])
    assert aug_summary.total_spent == 15431.00, f"Expected 15431.00, got {aug_summary.total_spent}"
    assert aug_summary.is_over_budget is True
    assert aug_summary.over_budget_amount == 5431.00
    assert aug_summary.category_totals.get("Food") == 2565.00
    assert aug_summary.category_totals.get("Shopping") == 4048.00
    assert aug_summary.category_totals.get("Bills") == 3608.00
    assert aug_summary.category_totals.get("Travel") == 2320.00
    assert aug_summary.category_totals.get("Health") == 1440.00
    assert aug_summary.category_totals.get("Store") == 1450.00
    assert aug_summary.top_category.category == "Shopping"

    # September Summary
    sep_summary = service.generate_summary(months=[9])
    assert sep_summary.highest_expense.merchant == "Seeds Purchase"
    assert sep_summary.highest_expense.amount == 5000.00

    print("[PASS] Expense Tracker Service accuracy tests passed (100% exact match)!")


def test_bridge():
    bridge = DesktopBridge()
    res = bridge.load_default_data()
    assert res["status"] == "success"
    assert res["data"]["total_spent"] == 15431.00

    # Filter both months
    res_both = bridge.filter_analytics(months=[8, 9])
    assert res_both["status"] == "success"
    assert res_both["data"]["total_spent"] > 15431.00

    print("[PASS] PyWebView Desktop Bridge tests passed!")


if __name__ == "__main__":
    print("\n--- Running PhonePe Expense Tracker Backend Tests ---")
    test_categorizer()
    test_parser_and_errors()
    test_expense_tracker_service()
    test_bridge()
    print("\n>>> ALL BACKEND TESTS PASSED WITH 100% ACCURACY! <<<\n")
