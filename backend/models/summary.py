"""Data models for expense summaries, category aggregates, and daily trends."""
from dataclasses import asdict, dataclass, field
from typing import Any
from .transaction import ParsingError, Transaction


@dataclass
class DailyTrendPoint:
    date: str
    total_amount: float
    transaction_count: int

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class CategoryAggregate:
    category: str
    amount: float
    percentage: float
    color: str
    transaction_count: int

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class TopCategory:
    category: str
    amount: float
    percentage: float

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class ExpenseSummary:
    total_spent: float
    budget_limit: float
    is_over_budget: bool
    over_budget_amount: float
    budget_percentage: float
    selected_months: list[int]
    month_names: list[str]
    categories: list[CategoryAggregate]
    category_totals: dict[str, float]
    daily_trends: list[DailyTrendPoint]
    top_category: TopCategory | None
    highest_expense: Transaction | None
    transactions: list[Transaction]
    parsing_errors: list[ParsingError]
    total_parsed: int
    total_skipped: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "total_spent": round(self.total_spent, 2),
            "budget_limit": round(self.budget_limit, 2),
            "is_over_budget": self.is_over_budget,
            "over_budget_amount": round(self.over_budget_amount, 2),
            "budget_percentage": round(self.budget_percentage, 1),
            "selected_months": self.selected_months,
            "month_names": self.month_names,
            "categories": [c.to_dict() for c in self.categories],
            "category_totals": {k: round(v, 2) for k, v in self.category_totals.items()},
            "daily_trends": [d.to_dict() for d in self.daily_trends],
            "top_category": self.top_category.to_dict() if self.top_category else None,
            "highest_expense": self.highest_expense.to_dict() if self.highest_expense else None,
            "transactions": [t.to_dict() for t in self.transactions],
            "parsing_errors": [e.to_dict() for e in self.parsing_errors],
            "total_parsed": self.total_parsed,
            "total_skipped": self.total_skipped,
        }
