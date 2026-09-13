"""Expense tracking service for analytics calculation and data aggregation."""
import calendar
from collections import defaultdict
from pathlib import Path
from backend.config.settings import BUDGET_LIMIT, OUTPUT_JSON_PATH
from backend.models.summary import (
    CategoryAggregate,
    DailyTrendPoint,
    ExpenseSummary,
    TopCategory,
)
from backend.models.transaction import ParsingError, Transaction
from backend.services.categorizer import CategorizationService
from backend.services.parser import TransactionParser
from backend.utils.decorators import timer
from backend.utils.file_handler import write_json_file


class ExpenseTrackerService:
    def __init__(
        self,
        budget_limit: float = BUDGET_LIMIT,
        parser: TransactionParser | None = None,
        categorizer: CategorizationService | None = None,
    ):
        self.budget_limit = budget_limit
        self.categorizer = categorizer or CategorizationService()
        self.parser = parser or TransactionParser(self.categorizer)
        self._cached_transactions: list[Transaction] = []
        self._cached_errors: list[ParsingError] = []

    def set_budget_limit(self, new_limit: float) -> None:
        """Updates the active budget limit."""
        if new_limit > 0:
            self.budget_limit = new_limit

    def load_data(
        self,
        file_path: Path | str | None = None,
        text_content: str | None = None,
    ) -> tuple[list[Transaction], list[ParsingError]]:
        """Loads and parses transactions from a file path or direct string content."""
        if text_content is not None:
            txns, errors = self.parser.parse_from_text(text_content)
        elif file_path is not None:
            txns, errors = self.parser.parse_from_file(file_path)
        else:
            txns, errors = [], []

        self._cached_transactions = txns
        self._cached_errors = errors
        return txns, errors

    @timer
    def generate_summary(
        self,
        months: list[int] | None = None,
        budget_limit: float | None = None,
    ) -> ExpenseSummary:
        """Generates comprehensive expense summary and chart analytics for selected months."""
        effective_budget = budget_limit if budget_limit is not None and budget_limit > 0 else self.budget_limit

        # If no transactions in memory, return empty summary
        if not self._cached_transactions:
            return ExpenseSummary(
                total_spent=0.0,
                budget_limit=effective_budget,
                is_over_budget=False,
                over_budget_amount=0.0,
                budget_percentage=0.0,
                selected_months=months or [],
                month_names=[],
                categories=[],
                category_totals={},
                daily_trends=[],
                top_category=None,
                highest_expense=None,
                transactions=[],
                parsing_errors=self._cached_errors,
                total_parsed=0,
                total_skipped=len(self._cached_errors),
            )

        # Filter transactions by requested months (if specified and non-empty)
        if months:
            selected_txns = [t for t in self._cached_transactions if t.month in months]
        else:
            selected_txns = list(self._cached_transactions)

        # Calculate Total Spent
        total_spent = sum(t.amount for t in selected_txns)

        # Category Aggregation
        cat_amounts: dict[str, float] = defaultdict(float)
        cat_counts: dict[str, int] = defaultdict(int)

        for txn in selected_txns:
            cat_amounts[txn.category] += txn.amount
            cat_counts[txn.category] += 1

        # Build CategoryAggregate objects sorted by amount descending
        categories: list[CategoryAggregate] = []
        for cat, amount in sorted(cat_amounts.items(), key=lambda x: x[1], reverse=True):
            pct = (amount / total_spent * 100) if total_spent > 0 else 0.0
            categories.append(
                CategoryAggregate(
                    category=cat,
                    amount=round(amount, 2),
                    percentage=round(pct, 1),
                    color=self.categorizer.get_color(cat),
                    transaction_count=cat_counts[cat],
                )
            )

        # Top Category
        top_category = None
        if categories:
            top_cat = categories[0]
            top_category = TopCategory(
                category=top_cat.category,
                amount=top_cat.amount,
                percentage=top_cat.percentage,
            )

        # Daily Trends
        daily_map: dict[str, tuple[float, int]] = defaultdict(lambda: (0.0, 0))
        for txn in selected_txns:
            curr_amt, curr_cnt = daily_map[txn.date]
            daily_map[txn.date] = (curr_amt + txn.amount, curr_cnt + 1)

        daily_trends: list[DailyTrendPoint] = [
            DailyTrendPoint(
                date=dt,
                total_amount=round(amt, 2),
                transaction_count=cnt,
            )
            for dt, (amt, cnt) in sorted(daily_map.items(), key=lambda x: x[0])
        ]

        # Highest single expense
        highest_expense = max(selected_txns, key=lambda t: t.amount, default=None)

        # Month names
        unique_months = sorted(list(set(t.month for t in selected_txns if t.month > 0)))
        month_names = [calendar.month_name[m] for m in unique_months if 1 <= m <= 12]

        # Budget Calculations
        is_over_budget = total_spent > effective_budget
        over_budget_amount = max(0.0, total_spent - effective_budget)
        budget_pct = (total_spent / effective_budget * 100) if effective_budget > 0 else 0.0

        return ExpenseSummary(
            total_spent=total_spent,
            budget_limit=effective_budget,
            is_over_budget=is_over_budget,
            over_budget_amount=over_budget_amount,
            budget_percentage=budget_pct,
            selected_months=months or unique_months,
            month_names=month_names,
            categories=categories,
            category_totals={c.category: c.amount for c in categories},
            daily_trends=daily_trends,
            top_category=top_category,
            highest_expense=highest_expense,
            transactions=selected_txns,
            parsing_errors=self._cached_errors,
            total_parsed=len(self._cached_transactions),
            total_skipped=len(self._cached_errors),
        )

    def save_summary_json(self, summary: ExpenseSummary, output_path: Path | str = OUTPUT_JSON_PATH) -> None:
        """Saves summary report to disk as JSON."""
        write_json_file(summary.to_dict(), output_path)
