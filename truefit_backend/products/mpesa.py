import requests
import json
import base64
from datetime import datetime
from requests.auth import HTTPBasicAuth
import os
import logging

logger = logging.getLogger(__name__)

# Sandbox configuration, these should be dynamically driven by environment variables in production
CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY", "placeholder_consumer_key")
CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET", "placeholder_consumer_secret")
BUSINESS_SHORTCODE = os.getenv("MPESA_SHORTCODE", "174379") # Safaricom sandbox till number
PASSKEY = os.getenv("MPESA_PASSKEY", "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919")

MPESA_ENV = os.getenv("MPESA_ENV", "sandbox") # 'sandbox' or 'production'

if MPESA_ENV == "sandbox":
    AUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
else:
    AUTH_URL = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    STK_PUSH_URL = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

def get_access_token():
    try:
        response = requests.get(AUTH_URL, auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET), timeout=10)
        response.raise_for_status()
        return response.json().get('access_token')
    except Exception as e:
        logger.error(f"Failed to get M-Pesa access token: {str(e)}")
        return None

def format_phone_number(phone_number):
    """
    Format standard 07... numbers to 2547...
    """
    phone_number = str(phone_number).strip().replace('+', '')
    if phone_number.startswith('0'):
        return f"254{phone_number[1:]}"
    if phone_number.startswith('7') or phone_number.startswith('1'):
        return f"254{phone_number}"
    return phone_number

def initiate_stk_push(phone_number, amount, order_id, callback_url):
    access_token = get_access_token()
    if not access_token:
        # Prevent crash if credentials are just placeholders currently
        logger.warning("No access token. Daraja API credentials might be missing or invalid.")
        return {"ResponseCode": "1", "errorMessage": "Failed to authenticate with M-Pesa."}
    
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password_str = BUSINESS_SHORTCODE + PASSKEY + timestamp
    password = base64.b64encode(password_str.encode()).decode('utf-8')
    
    formatted_phone = format_phone_number(phone_number)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "BusinessShortCode": BUSINESS_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": formatted_phone,
        "PartyB": BUSINESS_SHORTCODE,
        "PhoneNumber": formatted_phone,
        "CallBackURL": callback_url,
        "AccountReference": f"TrueFIT Order {order_id}",
        "TransactionDesc": "Payment for TrueFIT purchase"
    }

    try:
        response = requests.post(STK_PUSH_URL, json=payload, headers=headers, timeout=15)
        return response.json()
    except Exception as e:
        logger.error(f"STK Push Failed: {str(e)}")
        return {"ResponseCode": "1", "errorMessage": str(e)}

