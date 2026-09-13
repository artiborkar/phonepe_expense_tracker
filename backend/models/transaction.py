"""Data models for individual transactions and parsing errors."""
from dataclasses import asdict, dataclass
from typing import Any


@dataclass
class Transaction:
    id: int
    date: str
    merchant: str
    amount: float
    category: str = "Other"
    month: int = 0
    year: int = 2026

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class ParsingError:
    line_number: int
    raw_content: str
    reason: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
