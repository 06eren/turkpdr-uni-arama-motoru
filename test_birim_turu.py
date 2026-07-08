import json

with open('yokatlas_tum_temiz_veriler.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

birim_turleri = set()
for item in data:
    b = item.get('birimTuruAdi')
    if b:
        birim_turleri.add(b)

print(birim_turleri)
