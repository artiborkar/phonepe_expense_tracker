import logging
from dataclasses import asdict
from src.models.expense import Transaction ,ExpenseSummary
from src.services.categorize import get_category
from src.utils.file_handler import read_text_file , write_json_file
from src.utils.decorators import timer
from src.config.setting import BUDGET_LIMIT , DATA_FILE_PATH , OUTPUT_JSON_PATH 

looger = logging.getLogger("PhonePeTracer")

class ExpenseTrackerService:
    def __init__(self , data_path = DATA_FILE_PATH , budget_limit=BUDGET_LIMIT):
        self.data_path = data_path
        self.budget_limit = budget_limit

    @timer
    def parse_transaction(self) -> list[Transaction]:
        """ Parse the transaction data from the text file """
        raw_lines = read_text_file(self.data_path)
        # print("raw_line:",raw_lines)
        transactions : list[Transaction] = []


        for line_number , line in enumerate(raw_lines , start=1):
            line_str = line.strip()

            if not line_str:
                continue


            try:
                # print("line_str : ",line_str)
                date, merchant, amount_str =  line_str.split(",")
                print(f"Date : {date} , Merchant : {merchant} , Amount : {amount_str}")
                amount = float(amount_str.strip())
                category = get_category(merchant.strip())
                transactions.append(Transaction(date.strip(), merchant.strip(), amount, category))
            except Exception as e :
                looger.error(f"Skipped {line_number} transactin due to error : {e}")

        return transactions

    @timer
    def generate_summary(self , months : list[int]) ->ExpenseSummary:
        transactions : list[Transaction] = self.parse_transaction()
        # Filter transactions according to selected months
        selected_transactions = [ txn for txn in transactions if int(txn.data.split("-")[1]) in months]

        totals : dict[str , float] = {}
        total_spent : float = 0.0

        for txn in selected_transactions:
            totals[txn.category] = totals.get(txn.category , 0.0) + txn.amount
            total_spent += txn.amount

        return ExpenseSummary(
                                total_spent = round(total_spent , 2),
                                category_totals = {k : round(v , 2) for k , v in totals.items()},
                                is_over_budget= total_spent > self.budget_limit
                             )

    def save_summary(self , summary , output_path = OUTPUT_JSON_PATH) ->None:
        """ Save the summary to a JSON file """

        write_json_file(asdict(summary) , output_path)


# if __name__ == "__main__":
#     service = ExpenseTrackerService()
#     summary = service.generate_summary()
#     print(summary)
#     service.save_summary(summary)
#     print("Summary saved successfully!")