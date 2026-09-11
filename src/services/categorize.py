CATEGORY_MAP :dict[str , list[str]] = {
                                        "Food" :["swiggy","zomato","canteen","tea","restaurant"],
                                        "Travel":["ola","uber","rapido","metro","petrol"],
                                        "Shopping": ["demart","amazon","flipkart","myntra"],
                                        "Bills" : ["recharge","electricty","wifi","ticket","bill"],
                                        "Health": ["pharmacy","gym","Consultation"] ,
                                        "Store" : ["grocery" , "clothing" , "pharmacy"] ,
                                        "Salone" : ["haircut"] ,
                                        "Education" : ["course" , "Books"] ,
                                        "Farming" : ["supplies" , "fertilizer","seeds"]   ,
                                        "Electronics" : ["Electricity","Internet","mobile","earphones"]                                  
                                     }

def get_category(merchant_name : str)-> str:
    """ get the category for a given merchant name """
    merchant_clean = merchant_name.lower().strip()

    for category , keywords in CATEGORY_MAP.items():
        for keyword in keywords:
            if keyword in merchant_clean:
                return category

    return "Other"

# if __name__ == "__main__":
#     print(get_category("Uber Ride"))
#     print(get_category("Arti"))
#     print(get_category("Grocery Store"))