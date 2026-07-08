import json
from collections import Counter

with open('universiteler.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 1. ek_bilgi analizi (Burs, Dil, Ücretli vb.)
print("=== EK BILGI ANALIZI ===")
ek_bilgiler = []
for d in data:
    if d.get('ek_bilgi') and d['ek_bilgi'] not in ['*', '-']:
        # ek_bilgi bazen virgülle ayrılmış olabilir ama genelde tek string
        ek_bilgiler.append(d['ek_bilgi'].strip())

counter_ek_bilgi = Counter(ek_bilgiler)
print("En çok geçen 20 ek_bilgi:")
for k, v in counter_ek_bilgi.most_common(20):
    print(f"  '{k}': {v}")

# 2. Akreditasyon analizi
print("\n=== AKREDITASYON ANALIZI ===")
akreditasyonlar = [d['akreditasyon'] for d in data if d.get('akreditasyon') and d['akreditasyon'] not in ['*', '-']]
print("Akreditasyon kurumları:")
for k, v in Counter(akreditasyonlar).most_common(10):
    print(f"  '{k}': {v}")

# 3. TYÇ Durumu
print("\n=== TYC DURUMU ANALIZI ===")
tyc = [d['tyc_durumu'] for d in data if d.get('tyc_durumu')]
print(Counter(tyc).most_common())

# 4. Üniversite isimlerinde Vakıf/Devlet ipucu var mı? Veya KKTC üniversiteleri nasıl görünüyor?
kktc_unis = set()
for d in data:
    kosullar = (d.get('ozel_kosullar') or '').split(',')
    kosullar = [k.strip() for k in kosullar]
    if '4' in kosullar or '5' in kosullar or '6' in kosullar:
        kktc_unis.add(d['universite'])

print("\n=== KKTC Kodu İçeren Üniversiteler ===")
for u in list(kktc_unis)[:10]:
    print("  ", u)

# 5. Sehir listesi kontrolü (KKTC bir şehir olarak var mı?)
sehirler = set(d.get('sehir', '') for d in data)
print("\n=== Şehirler arasında KKTC / Kıbrıs var mı? ===")
kibris_sehirler = [s for s in sehirler if 'KKTC' in s or 'KIBRIS' in s or 'LEFKOŞA' in s or 'GİRNE' in s]
print(kibris_sehirler)

# 6. Öğretim Dili (bölüm adında veya ek_bilgide İngilizce, Arapça vb.)
dil_ing = sum(1 for d in data if 'İngilizce' in d.get('ek_bilgi','') or 'İngilizce' in d.get('bolum_program',''))
dil_arap = sum(1 for d in data if 'Arapça' in d.get('ek_bilgi','') or 'Arapça' in d.get('bolum_program',''))
print(f"\nİngilizce Program Sayısı: {dil_ing}")
print(f"Arapça Program Sayısı: {dil_arap}")
