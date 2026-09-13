"""Merchant categorization service based on rule keywords."""
from backend.config.settings import CATEGORY_COLORS, CATEGORY_RULES


class CategorizationService:
    def __init__(self, rules: dict[str, list[str]] = CATEGORY_RULES):
        self.rules = rules

    def get_category(self, merchant_name: str) -> str:
        """Determines the category for a given merchant name with keyword matching."""
        if not merchant_name:
            return "Other"

        merchant_clean = merchant_name.lower().strip()

        for category, keywords in self.rules.items():
            for keyword in keywords:
                if keyword in merchant_clean:
                    return category

        return "Other"

    def get_color(self, category: str) -> str:
        """Returns the hex color associated with a category."""
        return CATEGORY_COLORS.get(category, CATEGORY_COLORS["Other"])
