import json

with open('yokatlas_tum_temiz_veriler.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

puan_turleri = set()
for item in data:
    pt = item.get('puanTuru')
    if pt:
        puan_turleri.add(pt)

print("Puan Türleri:", puan_turleri)
