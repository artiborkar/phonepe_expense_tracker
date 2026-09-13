from backend.utils.logger import setup_logger
from backend.services.tracker import ExpenseTrackerService
from backend.config.settings import BUDGET_LIMIT, DATA_FILE_PATH

def main():
    logger = setup_logger()
    logger.info("Initializing PhonePe Expense Tracker ....")

    service = ExpenseTrackerService()
    service.load_data(DATA_FILE_PATH)

    while True:
        try:
            month_input = input("Enter month 8 = August , 9 = September , 8,9 = Both : ")
            months = [int(m.strip()) for m in month_input.split(",") if m.strip()]

            if not months or not all(month in (8, 9) for month in months):
                print(" Please enter only 8, 9, or 8,9.")
                continue
            break
        except ValueError:
            print("Please enter valid numbers.")

    # Generate summary for selected month/months
    summary = service.generate_summary(months)
    service.save_summary_json(summary)

    month_names = {8: "August", 9: "September"}
    selected_months = ", ".join(month_names.get(month, f"Month {month}") for month in months)

    print("\n" + "=" * 60)
    print("🗒️ ====  PHONEPE EXPENSE ANALYSIS REPORT ==== 🗒️")
    print("=" * 60 + "\n")

    print(f"Selected Month : {selected_months}")
    print(f"Total Money Spent : ₹{summary.total_spent:.2f}")
    print(f"\nSpending Breakdown By Category:")

    for cat in summary.categories:
        print(f"     {cat.category:14s} : ₹{cat.amount:8.2f} ({cat.percentage:5.1f}%)")

    print("-" * 60 + "\n")

    if summary.is_over_budget:
        print(f"\n ⚠️  WARNING : You Have Exceeded Your Monthly Budget Limit of ₹{BUDGET_LIMIT:.2f}")
    else:
        print(f"\n 🎉 Congratulations! You are within your budget limit of ₹{BUDGET_LIMIT:.2f}")

    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()



