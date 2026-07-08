import json

with open('yokatlas_tum_temiz_veriler.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

burs = set(item.get('bursOraniAdi') for item in data)
dil = set(item.get('ogrenimDiliAdi') for item in data)
turu = set(item.get('ogrenimTuruAdi') for item in data)

print("Burs:", burs)
print("Dil:", dil)
print("Turu:", turu)
