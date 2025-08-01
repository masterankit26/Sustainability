import base64

with open("firebase_creds.json", "rb") as f:
    encoded = base64.b64encode(f.read()).decode("utf-8")

with open("firebase_b64.txt", "w") as f:
    f.write(encoded)

print("🔥 Firebase Base64 string generated successfully!")