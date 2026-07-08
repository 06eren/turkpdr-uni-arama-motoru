import json
import os
import time
import requests

URL = "https://yokatlas.yok.gov.tr/api/tercih-kilavuz/search"
CIKTI_DOSYA = "yokatlas_tum_temiz_veriler.json"
SAYFA_BOYUTU = 100
BEKLEME_SN = 2

headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://yokatlas.yok.gov.tr/",
    "Origin": "https://yokatlas.yok.gov.tr",
    "Accept": "application/json, text/plain, */*",
}

UÇURULACAK_ALANLAR = [
    "kosulList",
    "minBasariSirasiKosul",
    "akreditasyonAck",
    "fymkKilAciklama",
]

tum_veriler = []
gorulen_kodlar = set()  # Mükerrer verileri engellemek için benzersiz ID havuzu

print("=" * 60)
print("  YÖK ATLAS TÜM VERİTABANI ÇEKİCİ (GÜVENLİ & TEKRAR KORUMALI)")
print("=" * 60)

try:
    # 46 = Lisans (4 Yıllık), 47 = Önlisans (2 Yıllık)
    for birim_turu in [46, 47]:
        tür_adı = (
            "LİSANS (4 YILLIK)" if birim_turu == 46 else "ÖNLİSANS (2 YILLIK)"
        )
        print(f"\n>>> {tür_adı} bölümleri çekilmeye başlanıyor...")

        sayfa = 0
        ardisik_kopya_sayisi = 0  # Sonsuz döngü koruması sayacı

        while True:
            payload = {
                "puan_turu": "",
                "universite": "",
                "program": "",
                "il": "",
                "birim_turu_id": str(birim_turu),
                "universite_turu": "",
                "burs_orani_id": "",
                "ogrenim_turu_id": "",
                "min_basari_sirasi": "",
                "max_basari_sirasi": "",
                "page": sayfa,
                "size": SAYFA_BOYUTU,
            }

            try:
                response = requests.post(
                    URL, json=payload, headers=headers, timeout=20
                )
                if response.status_code != 200:
                    print(
                        f"    [Hata] Durum Kodu: {response.status_code}. Yeniden deneniyor..."
                    )
                    time.sleep(2)
                    continue

                sayfa_verisi = response.json()
            except Exception as e:
                print(f"    [Bağlantı Hatası] {e}. Yeniden deneniyor...")
                time.sleep(2)
                continue

            # API'den gelen veriyi listeye dönüştürme mantığı
            program_listesi = []
            if isinstance(sayfa_verisi, list):
                program_listesi = sayfa_verisi
            elif isinstance(sayfa_verisi, dict):
                if (
                    "content" in sayfa_verisi
                    and isinstance(sayfa_verisi["content"], list)
                ):
                    program_listesi = sayfa_verisi["content"]
                else:
                    for deger in sayfa_verisi.values():
                        if isinstance(deger, list):
                            program_listesi = deger
                            break

            # 1. KORUMA: Sayfa tamamen boş geldiyse çık
            if not program_listesi:
                print(f"    [Bilgi] Sayfa {sayfa + 1}'de veri kalmadı.")
                break

            yeni_eklenen_sayisi = 0

            # Verileri filtrele ve benzersiz olanları ekle
            for prog in program_listesi:
                # Kılavuz kodu yoksa osymId'ye bak, o da yoksa nesnenin hash'ini al
                unique_id = prog.get("kilavuzKodu") or prog.get("osymKilavuzId")

                # 2. KORUMA: Eğer veri daha önce eklenmişse atla
                if unique_id in gorulen_kodlar:
                    continue

                gorulen_kodlar.add(unique_id)
                yeni_eklenen_sayisi += 1

                # Temizlik
                for alan in UÇURULACAK_ALANLAR:
                    prog.pop(alan, None)
                tum_veriler.append(prog)

            print(
                f"  -> Sayfa {sayfa + 1} indirildi. Net Yeni Veri: {yeni_eklenen_sayisi} / {len(program_listesi)} | Toplam: {len(tum_veriler)}"
            )

            # 3. KORUMA: Sayfadaki tüm veriler eskiyse ve bu durum üst üste tekrarlanıyorsa dur
            if yeni_eklenen_sayisi == 0:
                ardisik_kopya_sayisi += 1
                if ardisik_kopya_sayisi >= 3:
                    print(
                        f"    [Uyarı] Üst üste {ardisik_kopya_sayisi} sayfadır yeni veri gelmiyor, döngü sonlandırıldı."
                    )
                    break
            else:
                ardisik_kopya_sayisi = 0  # Yeni veri gelirse sayacı sıfırla

            # API'nin metadata verilerinden sayfa sonu kontrolü
            if isinstance(sayfa_verisi, dict):
                if sayfa_verisi.get("last") is True:
                    print(f"    [Bilgi] {tür_adı} için son sayfa sinyali alındı.")
                    break
                if (
                    "totalPages" in sayfa_verisi
                    and sayfa >= sayfa_verisi["totalPages"] - 1
                ):
                    print(f"    [Bilgi] Sayfa sınırına ulaşıldı.")
                    break

            if len(program_listesi) < SAYFA_BOYUTU:
                break

            sayfa += 1
            time.sleep(BEKLEME_SN)

except KeyboardInterrupt:
    print(
        "\n\n[!] İşlem kullanıcı tarafından kesildi! Çekilen kısım güvenli şekilde kaydediliyor..."
    )

# Dosyaya Yazma
if tum_veriler:
    with open(CIKTI_DOSYA, "w", encoding="utf-8") as f:
        json.dump(tum_veriler, f, ensure_ascii=False, indent=2)
    print("\n" + "=" * 60)
    print("İŞLEM BAŞARIYLA TAMAMLANDI!")
    print(
        f"Toplam {len(tum_veriler)} adet benzersiz üniversite programı lokal veritabanına yazıldı."
    )
    print(f"Dosya: {os.path.abspath(CIKTI_DOSYA)}")
    print("=" * 60)
else:
    print("\n[-] Kaydedilecek veri bulunamadı.")