import os
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv('truefit_backend/.env')

CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")

AUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

print(f"--- Testing M-Pesa Credentials ---")
print(f"Key: {CONSUMER_KEY[:5]}...{CONSUMER_KEY[-5:]}")
print(f"Secret: {CONSUMER_SECRET[:5]}...{CONSUMER_SECRET[-5:]}")

try:
    response = requests.get(AUTH_URL, auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET), timeout=10)
    if response.status_code == 200:
        print("\n✅ SUCCESS: Successfully authenticated with Safaricom Daraja API!")
        print(f"Access Token generated correctly.")
    else:
        print(f"\n❌ FAILED: Authentication failed with status code {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"\n❌ ERROR: An error occurred: {str(e)}")
