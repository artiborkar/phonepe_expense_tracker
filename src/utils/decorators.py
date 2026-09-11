import time
import logging
from typing import Callable

logger = logging.getLogger("PhonePeTracer")

def timer(func : Callable) ->Callable:
    def wrapper(*args , **kwargs):
        start_time = time.perf_counter()
        result = func(*args , **kwargs)
        end_time = time.perf_counter()
        logger.info(f"Execution of {func.__name__} took {end_time - start_time} sec.")
        return result
    return wrapper
    

# if __name__ == "__main__":
#     logging.basicConfig(level=logging.INFO)
#     @timer
#     def test_function():
#         time.sleep(2)
#         print("Function executed!")
#     test_function()
