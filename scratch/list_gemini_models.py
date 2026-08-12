import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
try:
    response = requests.get(url, timeout=10)
    print("List Models Status Code:", response.status_code)
    if response.status_code == 200:
        models = response.json().get('models', [])
        for m in models[:10]:
            print("Available Model:", m.get('name'))
    else:
        print("Error response:", response.text[:300])
except Exception as e:
    print("Exception:", e)
