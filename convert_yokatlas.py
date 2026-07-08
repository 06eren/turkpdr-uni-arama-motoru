import json
import re

def parse_val(val):
    if val is None or val == "":
        return "-"
    # If it's a number ending with .00000, keep it clean? Let's just stringify.
    return str(val)

def generate_ek_bilgi(item):
    parts = []
    
    # 1. Burs Durumu
    burs = item.get('bursOraniAdi')
    if burs and burs != "Ücretli":
        parts.append(burs)
    elif burs == "Ücretli":
        parts.append("Ücretli")
        
    # 2. Öğrenim Dili
    dil = item.get('ogrenimDiliAdi')
    if dil and dil != "Türkçe":
        parts.append(dil)
        
    # 3. Öğrenim Türü
    turu = item.get('ogrenimTuruAdi')
    if turu and turu not in ['Örgün Öğretim', '']:
        parts.append(turu)
        
    # 4. M.T.O.K. (birimAdi içinde geçer)
    birim_adi = item.get('birimAdi', '')
    if 'M.T.O.K.' in birim_adi:
        parts.append('M.T.O.K.')
        
    return " ".join(parts)

def main():
    with open('yokatlas_tum_temiz_veriler.json', 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    new_data = []
    for idx, item in enumerate(raw_data):
        ek_bilgi = generate_ek_bilgi(item)
        
        # In the previous schema, basari_sirasi_2025 comes from basariSirasi
        # basari_sirasi_2024 comes from basariSirasi1
        # basari_sirasi_2023 comes from basariSirasi2
        bs_2025 = item.get("basariSirasi")
        bs_2024 = item.get("basariSirasi1")
        bs_2023 = item.get("basariSirasi2")
        
        # In the old dataset, numbers like 551.132 were strings with dots
        # Let's ensure the format is correct
        tp_2025 = item.get("minPuan")
        if tp_2025 and isinstance(tp_2025, float):
            tp_2025 = f"{tp_2025:.5f}" # keep some precision
            
        tp_2024 = item.get("minPuan1")
        tp_2023 = item.get("minPuan2")
        
        prog = {
            "sira_no": str(idx + 1),
            "program_kodu": str(item.get("kilavuzKodu", "")),
            "puan_tipi": str(item.get("puanTuru", "")).strip(),
            "universite": str(item.get("universiteAdi", "")),
            "sehir": str(item.get("ilAdi", "")),
            "bolum_program": str(item.get("birimAdi", "")),
            "fakulte": str(item.get("fymkAdi", "")),
            "ek_bilgi": ek_bilgi,
            "sure_yil": str(item.get("ogrenimSuresi", "")),
            
            "basari_sirasi_2025": str(bs_2025) if bs_2025 else "-",
            "basari_sirasi_2024": str(bs_2024) if bs_2024 else "-",
            "basari_sirasi_2023": str(bs_2023) if bs_2023 else "-",
            
            "taban_puani_2025": str(tp_2025) if tp_2025 else "-",
            "taban_puani_2024": str(tp_2024) if tp_2024 else "-",
            "taban_puani_2023": str(tp_2023) if tp_2023 else "-",
            
            "kontenjan_2025_genel": str(item.get("kontenjan") or "0"),
            "kontenjan_2024_genel": str(item.get("gk1") or "0"),
            "kontenjan_2023_genel": str(item.get("gk2") or "0"),
            
            "kontenjan_2025_yrlsn": str(item.get("gkY") or "0"),
            
            "ozel_kosullar": str(item.get("kosul", "")),
            "akreditasyon": str(item.get("akreditasyon", "")),
            "tyc_durumu": str(item.get("tyc", "")),
            "program_id": str(item.get("kilavuzKodu", "")),
            "universite_turu": str(item.get("universiteTuru", "")),
            "program_turu": str(item.get("birimTuruAdi", "")),
            "egitim_dili": str(item.get("ogrenimDiliAdi", "")),
            "ucret_burs": str(item.get("bursOraniAdi", ""))
        }
        new_data.append(prog)

    with open('universiteler.json', 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=4)
        
    print(f"Başarıyla {len(new_data)} kayıt universiteler.json dosyasına yazıldı.")

if __name__ == "__main__":
    main()
