import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"

payload = {
    "contents": [{
        "parts": [{
            "text": "Generate ONLY a single line image prompt for a vector monogram logo mark of initial letters 'SD' styled in 3D tech aesthetic."
        }]
    }]
}

response = requests.post(url, json=payload, timeout=15)
print("Gemini Status Code:", response.status_code)
if response.status_code == 200:
    result = response.json()
    prompt = result['candidates'][0]['content']['parts'][0]['text'].strip()
    print("✅ GEMINI GENERATED PROMPT:", prompt)
else:
    print("Error response:", response.text[:200])
