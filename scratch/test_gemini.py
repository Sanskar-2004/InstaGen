import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

test_models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash"
]

for model in test_models:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [{
                "text": "Generate a detailed single-line image generation prompt for a vector logo emblem of initials SD."
            }]
        }]
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Gemini Model: {model} -> Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            prompt = result['candidates'][0]['content']['parts'][0]['text'].strip()
            print(f"✅ SUCCESS with {model}!\nPrompt: {prompt}\n")
            break
        else:
            print("Error:", response.text[:150])
    except Exception as e:
        print("Exception:", e)
