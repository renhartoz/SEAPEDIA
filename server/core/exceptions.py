from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        original_data = response.data
        if isinstance(original_data, dict) and "detail" in original_data:
            response.data = {
                "error": {
                    "code": exc.__class__.__name__.lower(),
                    "message": str(original_data["detail"]),
                }
            }
        elif isinstance(original_data, dict):
            response.data = {
                "error": {
                    "code": "validation_error",
                    "message": "Invalid input.",
                    "details": original_data,
                }
            }
    return response
