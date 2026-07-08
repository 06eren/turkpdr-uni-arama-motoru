import requests
from bs4 import BeautifulSoup
import json
import time
import os
import re

# ============================================================
# AYARLAR
# ============================================================
BASE_URL = "https://universitetercihleri.com/ddtercih/search"
SAYFA_BASI_KAYIT = 100
SAYFALAMA_TIPI = "offset"   # "sayfa" -> /search/1/100/0, /search/2/100/0 ...
                           # "offset" -> /search/0/100/0, /search/100/100/0 ...
UCUNCU_PARAM = 0

CHECKPOINT_DOSYA = "checkpoint.json"
FINAL_DOSYA = "universiteler.json"
MAX_SAYFA = 2000
CHECKPOINT_ARALIK = 10
MAX_DENEME = 3
MIN_SUTUN = 23

SUTUN_ESLEME = {
    "sira_no": 3,
    "program_kodu": 4,
    "puan_tipi": 5,
    "universite": 6,
    "bolum_program": 7,
    "ek_bilgi": 8,
    "sure_yil": 9,
    "basari_sirasi_2025": 10,
    "basari_sirasi_2024": 11,
    "basari_sirasi_2023": 12,
    "taban_puani_2025": 13,
    "taban_puani_2024": 14,
    "taban_puani_2023": 15,
    "kontenjanlar": 16,
    "ozel_kosullar": 20,
    "akreditasyon": 21,
    "tyc_durumu": 22,
}
# ============================================================


def temizle(metin):
    return re.sub(r'\s+', ' ', metin).strip()


def url_olustur(sayfa):
    if SAYFALAMA_TIPI == "sayfa":
        birinci_param = sayfa
    else:  # offset
        birinci_param = (sayfa - 1) * SAYFA_BASI_KAYIT
    return f"{BASE_URL}/{birinci_param}/{SAYFA_BASI_KAYIT}/{UCUNCU_PARAM}"


def veri_cek():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
    }

    session = requests.Session()
    session.headers.update(headers)

    tum_programlar = []
    gorulen_kodlar = set()
    onceki_sayfa_kodlari = None
    sayfa = 1

    print("=" * 60)
    print("VERİ ÇEKME İŞLEMİ BAŞLATILDI")
    print(f"Sayfalama tipi: {SAYFALAMA_TIPI}")
    print("=" * 60 + "\n")

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
        url = url_olustur(sayfa)
        print(f"Sayfa {sayfa} indiriliyor... ({url})")

        response = None
        for deneme in range(1, MAX_DENEME + 1):
            try:
                response = session.get(url, timeout=15)
                response.encoding = response.apparent_encoding
                break
            except requests.exceptions.RequestException as e:
                print(f"  Deneme {deneme}/{MAX_DENEME} başarısız: {e}")
                time.sleep(2 * deneme)

        if response is None:
            print(f"Sayfa {sayfa} {MAX_DENEME} denemede de alınamadı. Atlanıyor.")
            sayfa += 1
            continue

        if response.status_code != 200:
            print(f"Sayfa {sayfa} yüklenemedi (Durum Kodu: {response.status_code}). Sonlandırılıyor.")
            break

        soup = BeautifulSoup(response.text, 'html.parser')
        tablo = soup.find('table')
        satirlar = tablo.find_all('tr') if tablo else soup.find_all('tr')

        if len(satirlar) <= 2:
            print("\n[TEBRİKLER] Çekilecek başka sayfa kalmadı! Tüm veriler toplandı.")
            break

        bu_sayfa_kodlari = []
        yeni_eklenen = 0

        for satir in satirlar[2:]:
            sutunlar = [
                temizle(hucre.get_text(separator=" ", strip=True))
                for hucre in satir.find_all(['td', 'th'])
            ]

            if len(sutunlar) < MIN_SUTUN:
                continue

            program_kodu = sutunlar[SUTUN_ESLEME["program_kodu"]]
            bu_sayfa_kodlari.append(program_kodu)

            if program_kodu in gorulen_kodlar:
                continue

            program = {alan: sutunlar[idx] for alan, idx in SUTUN_ESLEME.items()}

            tum_programlar.append(program)
            gorulen_kodlar.add(program_kodu)
            yeni_eklenen += 1

        if onceki_sayfa_kodlari is not None and bu_sayfa_kodlari == onceki_sayfa_kodlari:
            print(f"\n[UYARI] Sayfa {sayfa} bir önceki sayfayla birebir aynı. Sonlandırılıyor.")
            break

        onceki_sayfa_kodlari = bu_sayfa_kodlari
        print(f"Sayfa {sayfa} işlendi. Bu sayfada eklenen: {yeni_eklenen}. Toplam: {len(tum_programlar)}")

        if sayfa % CHECKPOINT_ARALIK == 0:
            with open(CHECKPOINT_DOSYA, "w", encoding="utf-8") as f:
                json.dump({"son_sayfa": sayfa, "veriler": tum_programlar}, f, ensure_ascii=False, indent=4)
            print(f"  -> Ara kayıt alındı (checkpoint: sayfa {sayfa})")

        time.sleep(1.5)
        sayfa += 1

    if sayfa > MAX_SAYFA:
        print(f"\n[UYARI] Güvenlik sınırına ulaşıldı (MAX_SAYFA={MAX_SAYFA}). Kontrol et.")

    with open(FINAL_DOSYA, "w", encoding="utf-8") as f:
        json.dump(tum_programlar, f, ensure_ascii=False, indent=4)

    if os.path.exists(CHECKPOINT_DOSYA):
        os.remove(CHECKPOINT_DOSYA)

    print("\n" + "=" * 60)
    print("İŞLEM TAMAMLANDI!")
    print(f"Toplam {len(tum_programlar)} adet benzersiz program indirildi.")
    print(f"Veriler '{FINAL_DOSYA}' dosyasına kaydedildi.")
    print("=" * 60)


if __name__ == "__main__":
    veri_cek()