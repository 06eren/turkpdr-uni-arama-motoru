import requests
from bs4 import BeautifulSoup
import json
import time
import os

base_url = "https://universitetercihleri.com/yks-tyt-ayt-tercih"
CHECKPOINT_DOSYA = "universiteler_checkpoint.json"
FINAL_DOSYA = "universiteler.json"
MAX_SAYFA = 2000          # güvenlik sınırı - sonsuz döngüyü engeller
CHECKPOINT_ARALIK = 10    # her 10 sayfada bir diske yaz
MAX_DENEME = 3            # bir sayfa için tekrar deneme sayısı

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
}

session = requests.Session()
session.headers.update(headers)

tum_programlar = []
gorulen_kodlar = set()   # mükerrer program_kodu tespiti için
onceki_sayfa_kodlari = None
sayfa = 1

print("=" * 60)
print("OPTİMİZE VERİ ÇEKME İŞLEMİ BAŞLATILDI")
print("=" * 60 + "\n")

# --- Kaldığı yerden devam etme desteği ---
if os.path.exists(CHECKPOINT_DOSYA):
    devam = input(f"'{CHECKPOINT_DOSYA}' bulundu. Kaldığı yerden devam edilsin mi? (e/h): ").strip().lower()
    if devam == "e":
        with open(CHECKPOINT_DOSYA, "r", encoding="utf-8") as f:
            kayit = json.load(f)
        tum_programlar = kayit["veriler"]
        sayfa = kayit["son_sayfa"] + 1
        gorulen_kodlar = {p["program_kodu"] for p in tum_programlar}
        print(f"Kaldığı yerden devam ediliyor: Sayfa {sayfa}, mevcut kayıt: {len(tum_programlar)}\n")

while sayfa <= MAX_SAYFA:
    url = f"{base_url}?page={sayfa}"
    print(f"Sayfa {sayfa} indiriliyor...")

    response = None
    for deneme in range(1, MAX_DENEME + 1):
        try:
            response = session.get(url, timeout=15)
            response.encoding = response.apparent_encoding  # Türkçe karakter bozulmasını önler
            break
        except requests.exceptions.RequestException as e:
            print(f"  Deneme {deneme}/{MAX_DENEME} başarısız: {e}")
            time.sleep(2 * deneme)

    if response is None:
        print(f"Sayfa {sayfa} {MAX_DENEME} denemede de alınamadı. Atlanıyor.")
        sayfa += 1
        continue

    if response.status_code != 200:
        print(f"Sayfa {sayfa} yüklenemedi (Durum Kodu: {response.status_code}). İşlem sonlandırılıyor.")
        break

    soup = BeautifulSoup(response.text, 'html.parser')

    # Tabloyu spesifik olarak hedeflemeye çalış; bulunamazsa tüm tr'lere düş
    tablo = soup.find('table')
    satirlar = tablo.find_all('tr') if tablo else soup.find_all('tr')

    if len(satirlar) <= 2:
        print("\n[TEBRİKLER] Çekilecek başka sayfa kalmadı! Tüm veriler toplandı.")
        break

    bu_sayfa_kodlari = []
    yeni_eklenen = 0

    for satir in satirlar[2:]:
        sutunlar = [hucre.text.strip() for hucre in satir.find_all(['td', 'th'])]

        if len(sutunlar) >= 23:
            program_kodu = sutunlar[4]
            bu_sayfa_kodlari.append(program_kodu)

            # Aynı program_kodu daha önce eklenmişse atla (mükerrer engeli)
            if program_kodu in gorulen_kodlar:
                continue

            program = {
                "sira_no": sutunlar[3],
                "program_kodu": program_kodu,
                "puan_tipi": sutunlar[5],
                "universite": sutunlar[6],
                "bolum_program": sutunlar[7],
                "ek_bilgi": sutunlar[8],
                "sure_yil": sutunlar[9],
                "basari_sirasi_2025": sutunlar[10],
                "basari_sirasi_2024": sutunlar[11],
                "basari_sirasi_2023": sutunlar[12],
                "taban_puani_2025": sutunlar[13],
                "taban_puani_2024": sutunlar[14],
                "taban_puani_2023": sutunlar[15],
                "kontenjanlar": sutunlar[16],
                "ozel_kosullar": sutunlar[20],
                "akreditasyon": sutunlar[21],
                "tyc_durumu": sutunlar[22]
            }
            tum_programlar.append(program)
            gorulen_kodlar.add(program_kodu)
            yeni_eklenen += 1

    # Bu sayfadaki kodlar önceki sayfayla birebir aynıysa döngüye girmiş demektir
    if onceki_sayfa_kodlari is not None and bu_sayfa_kodlari == onceki_sayfa_kodlari:
        print(f"\n[UYARI] Sayfa {sayfa} bir önceki sayfayla birebir aynı geldi. Site muhtemelen son sayfayı tekrarlıyor. Durduruluyor.")
        break

    onceki_sayfa_kodlari = bu_sayfa_kodlari

    print(f"Sayfa {sayfa} işlendi. Bu sayfada yeni eklenen: {yeni_eklenen}. Toplam: {len(tum_programlar)}")

    # Periyodik checkpoint (ara kayıt) - kesinti olursa baştan başlamana gerek kalmaz
    if sayfa % CHECKPOINT_ARALIK == 0:
        with open(CHECKPOINT_DOSYA, "w", encoding="utf-8") as f:
            json.dump({"son_sayfa": sayfa, "veriler": tum_programlar}, f, ensure_ascii=False, indent=4)
        print(f"  -> Ara kayıt alındı (checkpoint: sayfa {sayfa})")

    time.sleep(1.5)
    sayfa += 1

if sayfa > MAX_SAYFA:
    print(f"\n[UYARI] Güvenlik sınırına ulaşıldı (MAX_SAYFA={MAX_SAYFA}). Muhtemelen site sonsuz sayfa üretiyor, kontrol et.")

# --- Final kayıt ---
with open(FINAL_DOSYA, "w", encoding="utf-8") as f:
    json.dump(tum_programlar, f, ensure_ascii=False, indent=4)

# İşlem bitince checkpoint dosyasını temizle
if os.path.exists(CHECKPOINT_DOSYA):
    os.remove(CHECKPOINT_DOSYA)

print("\n" + "=" * 60)
print("İŞLEM TAMAMLANDI!")
print(f"Toplam {len(tum_programlar)} adet benzersiz üniversite programı indirildi.")
print(f"Veriler '{FINAL_DOSYA}' dosyasına kaydedildi.")
print("=" * 60)