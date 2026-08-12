import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.getenv("HUGGINGFACE_API_KEY")

test_models = [
    "stabilityai/stable-diffusion-3.5-large",
    "stabilityai/stable-diffusion-xl-base-1.0",
    "runwayml/stable-diffusion-v1-5",
    "prompthero/openjourney"
]

for model in test_models:
    url = f"https://router.huggingface.co/hf-inference/models/{model}"
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {"inputs": "A vector logo mark of letters SD, monogram emblem"}
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        print(f"Model: {model} -> Status: {response.status_code}")
        if response.status_code == 200:
            print(f"✅ SUCCESS with {model}! Image bytes: {len(response.content)}")
            break
        else:
            print("Response:", response.text[:150])
    except Exception as e:
        print("Error:", e)
