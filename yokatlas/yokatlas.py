from yokatlas_py import YokAtlasClient, SearchFilters, Settings
import json
import time
import math

# ============================================================
# FİLTRELER — YÖK Atlas sitesindeki tüm filtreler burada
# İstemediğin filtreyi None bırak, o filtre uygulanmaz
# ============================================================
FILTRELER = SearchFilters(
    puan_turu=None,            # "SAY" | "SÖZ" | "EA" | "DİL" | "TYT"
    universite=None,           # örn: "boğaziçi"  veya  ["boğaziçi", "koç"]
    program=None,              # örn: "bilgisayar mühendisliği"
    il=None,                   # örn: "istanbul"  veya  ["istanbul", "ankara"]
    birim_turu_id=46,          # 46 = LİSANS, 47 = ÖNLİSANS
    universite_turu = None,      # "DEVLET" | "VAKIF" | "KKTC"
    burs_orani_id=None,        # 0 = Ücretsiz / Burslu (siteden id'leri kontrol edilebilir)
    ogrenim_turu_id=None,      # Örgün / İkinci Öğretim
    min_basari_sirasi=None,    # örn: 1
    max_basari_sirasi=None,    # örn: 50000
)

# Not: "universite" (akıllı arama) ile "universite_id" (ID listesi) aynı anda kullanılamaz.
# Aynı kural "program"/"birim_grup_id" ve "il"/"il_kodu" için de geçerli.

SAYFA_BOYUTU = 5          # tek istekte kaç kayıt (max 500 destekleniyor)
CIKTI_DOSYA = "yokatlas_veri.json"
CHECKPOINT_DOSYA = "yokatlas_checkpoint.json"
CHECKPOINT_ARALIK = 5       # her 5 sayfada bir ara kayıt
BEKLEME_SN = 1.5            # istekler arası bekleme (sunucuyu yormamak için)

# ============================================================


def veri_cek():
    settings = Settings(timeout=60.0, max_retries=3)

    tum_programlar = []
    sayfa = 0  # kütüphane 0-index kullanıyor olabilir, ilk sayfada kontrol edeceğiz

    print("=" * 60)
    print("YÖK ATLAS VERİ ÇEKME İŞLEMİ BAŞLATILDI")
    print("=" * 60 + "\n")

    with YokAtlasClient(settings=settings) as client:
        # İlk isteği atıp toplam kayıt/sayfa sayısını öğrenelim
        ilk_sayfa = client.search(FILTRELER, page=sayfa, size=SAYFA_BOYUTU)
        toplam_kayit = ilk_sayfa.total_elements
        toplam_sayfa = math.ceil(toplam_kayit / SAYFA_BOYUTU)

        print(f"Filtrelere uyan toplam kayıt: {toplam_kayit}")
        print(f"Toplam sayfa sayısı: {toplam_sayfa}\n")

        while sayfa < toplam_sayfa:
            print(f"Sayfa {sayfa + 1}/{toplam_sayfa} işleniyor...")

            try:
                if sayfa == 0:
                    sonuc = ilk_sayfa
                else:
                    sonuc = client.search(FILTRELER, page=sayfa, size=SAYFA_BOYUTU)
            except Exception as e:
                print(f"  [Hata] Sayfa {sayfa + 1} alınamadı: {e}")
                time.sleep(2)
                continue

            for prog in sonuc.content:
                # Pydantic modelini eksiksiz dict'e çeviriyoruz -> hiçbir alan atlanmaz
                program_dict = prog.model_dump()
                tum_programlar.append(program_dict)

            print(f"  -> Bu sayfada {len(sonuc.content)} kayıt eklendi. Toplam: {len(tum_programlar)}")

            if (sayfa + 1) % CHECKPOINT_ARALIK == 0:
                with open(CHECKPOINT_DOSYA, "w", encoding="utf-8") as f:
                    json.dump(tum_programlar, f, ensure_ascii=False, indent=2)
                print(f"  -> Ara kayıt alındı (checkpoint: sayfa {sayfa + 1})")

            sayfa += 1
            time.sleep(BEKLEME_SN)

    with open(CIKTI_DOSYA, "w", encoding="utf-8") as f:
        json.dump(tum_programlar, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("İŞLEM TAMAMLANDI!")
    print(f"Toplam {len(tum_programlar)} adet program indirildi.")
    print(f"Veriler '{CIKTI_DOSYA}' dosyasına kaydedildi.")
    print("=" * 60)


if __name__ == "__main__":
    veri_cek()