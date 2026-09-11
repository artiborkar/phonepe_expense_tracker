from src.utils.logger import setup_logger
from src.services.tracker import ExpenseTrackerService
from src.config.setting import BUDGET_LIMIT

def main():
    logger = setup_logger()
    logger.info("Initializing PhonePe Expense Tracker ....")

    service = ExpenseTrackerService()

    while True:
        try :
            month_input = input("Enter month 8 = August , 9 = September , 8,9 = Both : ")
            months = [int(m.strip()) for m in month_input.split(",")]

            if not all(month in (8,9) for month in months):
                print(" Please enter only 8,9, or 8,9.")
                continue
            break
        except ValueError as e:
            print("Please Enter Valied Number..")

    
    # Generate summary for selected month/months
    summary = service.generate_summary(months)
    service.save_summary(summary) 

    month_names = { 8 : "August",
                   9 : "September"
                 }

    selected_months = "," .join(month_names[month] for month in months)


    print("\n" + "="*60)
    print("🗒️ ====  PHONEPE EXPENSE ANALYSIS REPORT ==== 🗒️")
    print("="*60 + "\n")

    print(f"Selected Month : {selected_months}")
    print(f"Total Money Spent : {summary.total_spent:.2f}")
    print(f"\nSpending Breakdown By Category:")

    for category , amount in summary.category_totals.items():
        print(f"     {category:12s} : {amount:.2f}")

    print("-"*60 + "\n")

    if summary.is_over_budget:
        print(f"\n ⚠️  WARNING : You Have Exceeded Your Monthly Budget Limit of {BUDGET_LIMIT}")
    else:
        print(f"\n 🎉 Cogratulation! You are within your budget limit of {BUDGET_LIMIT}")

    print("="*60 + "\n")


if __name__=="__main__":
    main()



