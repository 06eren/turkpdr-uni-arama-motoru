import json

with open('yokatlas_tum_temiz_veriler.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    for key, value in item.items():
        if isinstance(value, str) and 'yetenek' in value.lower():
            print(f"Found in key: {key} -> {value}")
            break
