import json
with open('yokatlas_tum_temiz_veriler.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print("Uni Turu:", set(d.get('universiteTuru') for d in data))
print("Puan Turu:", set(d.get('puanTuru') for d in data))
