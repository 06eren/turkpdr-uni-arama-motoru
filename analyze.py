import json

with open('universiteler.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Uzaktan örnekleri
print("=== UZAKTAN EGITIM ORNEKLERI ===")
uzak = [d for d in data if 'uzaktan' in d.get('fakulte','').lower() or 'uzaktan' in d.get('bolum_program','').lower()]
for d in uzak[:5]:
    print(f"  fakülte={d['fakulte']!r}, sure={d['sure_yil']!r}")

# MYO kontrolü - farklı keyword'lar
print("\n=== MYO ORNEKLERI ===")
myo_keywords = ['meslek y', 'myo', 'm.y.o', 'yüksekokul', 'yüksek okul']
for kw in myo_keywords:
    count = sum(1 for d in data if kw in d.get('fakulte','').lower())
    print(f"  '{kw}' -> {count} kayıt")

# 'okul' geçen fakülteler
print("\n=== Fakülte adında 'okul' geçenler (sample) ===")
okul = [d for d in data if 'okul' in d.get('fakulte','').lower()][:5]
for d in okul:
    print(f"  {d['fakulte']!r} sure={d['sure_yil']}")

# 5 yıllık örnek
print("\n=== 5 YILLIK PROGRAMLAR ===")
yil5 = [d for d in data if d.get('sure_yil') == '5'][:3]
for d in yil5:
    print(f"  {d['bolum_program']!r} - {d['fakulte']!r}")

# sure_yil tam dağılım
from collections import Counter
print("\n=== SURE_YIL DAGILIMI ===")
for k, v in Counter(d.get('sure_yil','') for d in data).most_common():
    print(f"  '{k}': {v}")

# Puan tipi tam dağılım
print("\n=== PUAN TIPI DAGILIMI ===")
for k, v in Counter(d.get('puan_tipi','') for d in data).most_common():
    print(f"  '{k}': {v}")

# Sıralama alanlarında '-' olan kayıtlar
dash_sira = sum(1 for d in data if d.get('basari_sirasi_2025') == '-')
dash_puan = sum(1 for d in data if d.get('taban_puani_2025') == '-')
print(f"\nbasari_sirasi_2025 = '-': {dash_sira}")
print(f"taban_puani_2025 = '-': {dash_puan}")

# Kontenjan sorunları
kontenjan_bos = [d for d in data if not d.get('kontenjan_2025_genel') or d.get('kontenjan_2025_genel') == '-']
print(f"kontenjan_2025_genel boş/dash: {len(kontenjan_bos)}")

# Sıralama mantığı kontrolü: sort ne kadar doğru?
# basari_sirasi_2025 numeric olmayan değerler
non_numeric_sira = [d for d in data if d.get('basari_sirasi_2025') not in ('-', '') and not d.get('basari_sirasi_2025','').replace('.','').replace(',','').isdigit()]
print(f"\nNumeric olmayan basari_sirasi_2025: {len(non_numeric_sira)}")
for d in non_numeric_sira[:5]:
    print(f"  {d['basari_sirasi_2025']!r}")
