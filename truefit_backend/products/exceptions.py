from rest_framework.views import exception_handler
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that:
    1. Logs all unhandled errors server-side.
    2. Returns a consistent JSON error format.
    3. Never leaks stack traces or internal details to the client.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Wrap DRF errors in a consistent shape: { "error": "...", "details": {...} }
        error_payload = {
            'error': True,
            'message': _extract_message(response.data),
            'status_code': response.status_code,
        }
        response.data = error_payload
    else:
        # Unhandled server error - log it but don't expose internals
        logger.exception("Unhandled server error: %s", exc)
        return Response(
            {'error': True, 'message': 'An internal server error occurred. Please try again later.', 'status_code': 500},
            status=500
        )

    return response


def _extract_message(data) -> str:
    """Flatten DRF validation errors into a single readable string."""
    if isinstance(data, dict):
        messages = []
        for key, value in data.items():
            if isinstance(value, list):
                messages.append(f"{key}: {', '.join(str(v) for v in value)}")
            else:
                messages.append(str(value))
        return ' | '.join(messages)
    if isinstance(data, list):
        return ' | '.join(str(item) for item in data)
    return str(data)
