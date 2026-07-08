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
UCUNCU_PARAM = 0

CHECKPOINT_DOSYA = "checkpoint.json"
FINAL_DOSYA = "universiteler.json"
MAX_SAYFA = 2000
CHECKPOINT_ARALIK = 10
MAX_DENEME = 3
MIN_SUTUN = 23

# ============================================================


def temizle(metin):
    """Fazla boşlukları tek boşluğa indirir, baş/son boşlukları siler."""
    return re.sub(r'\s+', ' ', metin).strip()


def hucre_ayir(hucre):
    """
    <strong> etiketindeki ana metni (üniversite/bölüm adı) ve
    <span class="info"> içindeki ikincil metni (şehir/fakülte) ayırır.
    Örnek: <strong>KOÇ</strong><span class="info">İSTANBUL</span>
           -> ("KOÇ", "İSTANBUL")
    """
    strong_tag = hucre.find('strong')
    info_tag = hucre.find('span', class_='info')

    if strong_tag:
        ana = temizle(strong_tag.get_text(strip=True))
    else:
        ana = temizle(hucre.get_text(separator=" ", strip=True))

    detay = temizle(info_tag.get_text(strip=True)) if info_tag else ""

    return ana, detay


def url_olustur(sayfa):
    offset = (sayfa - 1) * SAYFA_BASI_KAYIT
    return f"{BASE_URL}/{offset}/{SAYFA_BASI_KAYIT}/{UCUNCU_PARAM}"


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
            hucreler = satir.find_all(['td', 'th'])

            if len(hucreler) < MIN_SUTUN:
                continue

            def metin(i):
                return temizle(hucreler[i].get_text(separator=" ", strip=True))

            program_kodu = metin(4)
            bu_sayfa_kodlari.append(program_kodu)

            if program_kodu in gorulen_kodlar:
                continue

            # Üniversite adı + şehir ayrımı
            universite, sehir = hucre_ayir(hucreler[6])
            # Bölüm/program adı + fakülte ayrımı
            bolum_program, fakulte = hucre_ayir(hucreler[7])

            # Gerçek program detay linki üniversite hücresindeki <a> etiketinde
            link_tag = hucreler[6].find('a')
            program_id = None
            if link_tag and link_tag.get('href'):
                href = link_tag['href']
                if 'javascript' not in href:
                    program_id = href.rstrip('/').split('/')[-1]

            program = {
                "sira_no": metin(3),
                "program_kodu": program_kodu,
                "puan_tipi": metin(5),
                "universite": universite,
                "sehir": sehir,
                "bolum_program": bolum_program,
                "fakulte": fakulte,
                "ek_bilgi": metin(8),
                "sure_yil": metin(9),
                "basari_sirasi_2025": metin(10),
                "basari_sirasi_2024": metin(11),
                "basari_sirasi_2023": metin(12),
                "taban_puani_2025": metin(13),
                "taban_puani_2024": metin(14),
                "taban_puani_2023": metin(15),
                "kontenjan_2025_genel": metin(16),
                "kontenjan_2024_genel": metin(17),
                "kontenjan_2023_genel": metin(18),
                "kontenjan_2025_yrlsn": metin(19),
                "ozel_kosullar": metin(20),
                "akreditasyon": metin(21),
                "tyc_durumu": metin(22),
                "program_id": program_id,
            }

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