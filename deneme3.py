import json
with open('yokatlas_tum_temiz_veriler.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for d in data:
    b = str(d.get('birimAdi') or '').lower()
    t = str(d.get('birimTuruAdi') or '')
    p = str(d.get('puanTuru') or '')
    if 'yetenek' in b or 'yetenek' in str(d.get('kosul') or '').lower():
        print(d.get('birimAdi'), d.get('puanTuru'), d.get('birimTuruAdi'))
        break
