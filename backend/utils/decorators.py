"""Utility decorators for execution timing and logging."""
import functools
import logging
import time
from typing import Any, Callable

logger = logging.getLogger("PhonePeTracker")


def timer(func: Callable) -> Callable:
    """Decorator to measure and log function execution time."""
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        duration = (time.perf_counter() - start_time) * 1000
        logger.debug(f"{func.__name__} executed in {duration:.2f}ms")
        return result
    return wrapper
