import json
with open('yokatlas_tum_temiz_veriler.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Tablo Turu:", set(d.get('tabloTuru') for d in data))
