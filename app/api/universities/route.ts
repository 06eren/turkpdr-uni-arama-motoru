import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { UniversityProgram, PaginatedResponse } from '@/types/university';

let cachedData: UniversityProgram[] | null = null;

async function getUniversitiesData(): Promise<UniversityProgram[]> {
  if (cachedData) return cachedData;
  try {
    const filePath = path.join(process.cwd(), 'universiteler.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    cachedData = JSON.parse(fileContents);
    return cachedData!;
  } catch (error) {
    console.error('Error reading universiteler.json:', error);
    return [];
  }
}

// --- Yardımcı: Türkçe sayı formatını float'a çevir (551.132 -> 551.132 float) ---
// Not: Veride taban puanı 551.132 gibi noktalı float, başarı sırası ise 1000000 gibi tam sayı
function parseScore(val: string): number {
  if (!val || val === '-') return 0;
  // Taban puanı formatı: 551.132 (nokta ondalık ayracı)
  // Başarı sırası: 38, 1000000 vb (tam sayı)
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

function parseRank(val: string): number {
  if (!val || val === '-') return 999999999;
  // Sıralama sayıları bazen 1.000.000 (binlik nokta) formatında olabilir
  // Önce noktalı float mi kontrol et, değilse binlik ayracı temizle
  const stripped = val.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(stripped);
  return isNaN(num) ? 999999999 : num;
}

// --- Yardımcı: Fakülte/program türünü belirle ---
// Gerçek veri analizi sonuçlarına göre güncellenmiş keyword'lar:
//   - MYO/2 yıllık: fakülte adında 'yüksekokul' geçiyor, sure_yil='2' YOK (bu dataset sadece 4/5/6 yıl)
//   - Açıköğretim: 'Açıköğretim Fakültesi' veya 'Açık ve Uzaktan Eğitim Fakültesi'
//   - Uzaktan: 'Açık ve Uzaktan Eğitim Fakültesi'
//   - 5 yıllık: Diş Hekimliği, Eczacılık, Mimarlık bazı bölümler
//   - 6 yıllık: Tıp Fakültesi
function getProgramTuru(item: UniversityProgram): string {
  const f = (item.fakulte || '').toLowerCase();
  const b = (item.bolum_program || '').toLowerCase();
  const ek = (item.ek_bilgi || '').toLowerCase();

  // Uzaktan eğitim: 'açık ve uzaktan eğitim fakültesi'
  if (f.includes('uzaktan')) {
    return 'uzaktan';
  }

  // Açıköğretim: 'açıköğretim fakültesi' (uzaktan olmayan)
  if (f.includes('açıköğretim') || b.includes('açıköğretim') || ek.includes('açıköğretim')) {
    return item.sure_yil === '2' ? 'acikogretim_2' : 'acikogretim_4';
  }

  // Y.O. (Yüksekokul) - 4 yıllık lisans ama fakülte değil Y.O.
  if (f.includes('yüksekokul') || f.includes('yüksek okul')) {
    return 'yuksekokul';
  }

  // 2 yıllık: MYO (bu datasette sure_yil=2 olan yok ama ilerisi için)
  if (item.sure_yil === '2') {
    return '2_yillik';
  }

  // Özel yetenek
  if (b.includes('özel yetenek') || ek.includes('özel yetenek')) {
    return 'ozel_yetenek';
  }

  return '4_yillik';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q')?.toLowerCase().trim() || '';
  const puan_tipi = searchParams.get('puan_tipi') || '';
  const sehir = searchParams.get('sehir') || '';
  const universite = searchParams.get('universite') || '';
  const program_turu = searchParams.get('program_turu') || '';
  const uyruk = searchParams.get('uyruk') || '';
  const sira_min = searchParams.get('sira_min') ? parseFloat(searchParams.get('sira_min')!) : null;
  const sira_max = searchParams.get('sira_max') ? parseFloat(searchParams.get('sira_max')!) : null;
  const puan_min = searchParams.get('puan_min') ? parseFloat(searchParams.get('puan_min')!) : null;
  const puan_max = searchParams.get('puan_max') ? parseFloat(searchParams.get('puan_max')!) : null;
  const yeni_acilan = searchParams.get('yeni_acilan') === '1';
  const dolmamis = searchParams.get('dolmamis') === '1';
  const okul_birincisi = searchParams.get('okul_birincisi') === '1';
  const depremzede = searchParams.get('depremzede') === '1';
  const sehit_gazi = searchParams.get('sehit_gazi') === '1';
  const kadin_34 = searchParams.get('kadin_34') === '1';

  const siralama = searchParams.get('siralama') || 'basari_sirasi';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let data = await getUniversitiesData();
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Data not found' }, { status: 500 });
  }

  // --- Filtering ---
  data = data.filter((item) => {
    if (puan_tipi && item.puan_tipi !== puan_tipi) return false;
    if (sehir && item.sehir !== sehir) return false;
    if (universite && item.universite !== universite) return false;

    // Program türü filtresi
    if (program_turu) {
      const tur = getProgramTuru(item);
      if (program_turu === 'ozel_yetenek') {
        if (tur !== 'ozel_yetenek') return false;
      } else if (tur !== program_turu) {
        return false;
      }
    }

    // Uyruk filtresi: ozel_kosullar alanında T.C.=kod 22, KKTC=bazı kodlar
    if (uyruk === 'tc') {
      const kosullar = item.ozel_kosullar || '';
      const codes = kosullar.split(',').map(s => s.trim());
      // T.C. uyruklu = sadece 22 kodu içermeyenler (TC'ye açık)
      // Basit yaklaşım: KKTC özel kodu içerenleri hariç tut
      if (codes.includes('4') || codes.includes('5') || codes.includes('6')) return false;
    }
    if (uyruk === 'kktc') {
      const kosullar = item.ozel_kosullar || '';
      const codes = kosullar.split(',').map(s => s.trim());
      if (!codes.includes('4') && !codes.includes('5') && !codes.includes('6')) return false;
    }

    // Özel koşul filtreleri (ÖSYM kodları)
    if (okul_birincisi) {
      const codes = (item.ozel_kosullar || '').split(',').map(s => s.trim());
      if (!codes.includes('1')) return false;
    }
    if (depremzede) {
      const codes = (item.ozel_kosullar || '').split(',').map(s => s.trim());
      if (!codes.some(c => c === '320' || c === '321' || c === '322')) return false;
    }
    if (sehit_gazi) {
      const codes = (item.ozel_kosullar || '').split(',').map(s => s.trim());
      if (!codes.some(c => ['34', '144', '155', '162', '167'].includes(c))) return false;
    }
    if (kadin_34) {
      const codes = (item.ozel_kosullar || '').split(',').map(s => s.trim());
      if (!codes.includes('266')) return false;
    }

    // Yeni açılan bölüm: 2024 VE 2023 verisi yoksa yeni açılan
    if (yeni_acilan) {
      const no2024 = !item.basari_sirasi_2024 || item.basari_sirasi_2024 === '-' || item.basari_sirasi_2024 === '';
      const no2023 = !item.basari_sirasi_2023 || item.basari_sirasi_2023 === '-' || item.basari_sirasi_2023 === '';
      if (!no2024 || !no2023) return false;
    }

    // Kontenjanı dolmamış: yerleşen kontenjan < genel kontenjan
    if (dolmamis) {
      const genel = parseInt(item.kontenjan_2025_genel) || 0;
      const yerlesen = parseInt(item.kontenjan_2025_yrlsn) || 0;
      if (genel > 0 && yerlesen >= genel) return false;
    }

    // Sıralama aralığı filtresi
    if (sira_min !== null || sira_max !== null) {
      const sira = parseRank(item.basari_sirasi_2025);
      if (sira === 999999999) return false; // Sıralaması olmayan programları filtreden çıkar
      if (sira_min !== null && sira < sira_min) return false;
      if (sira_max !== null && sira > sira_max) return false;
    }

    // Puan aralığı filtresi
    if (puan_min !== null || puan_max !== null) {
      const puan = parseScore(item.taban_puani_2025);
      if (puan === 0) return false; // Puanı olmayan programları çıkar
      if (puan_min !== null && puan < puan_min) return false;
      if (puan_max !== null && puan > puan_max) return false;
    }

    // Text arama
    if (query) {
      const searchString = `${item.universite} ${item.bolum_program} ${item.fakulte} ${item.sehir} ${item.program_kodu} ${item.ek_bilgi}`.toLowerCase();
      if (!searchString.includes(query)) return false;
    }

    return true;
  });

  // --- Sorting ---
  data = [...data].sort((a, b) => {
    if (siralama === 'taban_puani') {
      const pA = parseScore(a.taban_puani_2025);
      const pB = parseScore(b.taban_puani_2025);
      return pB - pA; // Yüksek puan önce
    } else if (siralama === 'program_kodu') {
      return a.program_kodu.localeCompare(b.program_kodu);
    } else {
      // Başarı sırasına göre (küçük sıra = daha iyi = önce gelir)
      const sA = parseRank(a.basari_sirasi_2025);
      const sB = parseRank(b.basari_sirasi_2025);
      return sA - sB;
    }
  });

  // --- Pagination ---
  const total = data.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedData = data.slice(offset, offset + limit);

  const response: PaginatedResponse<UniversityProgram> = {
    data: paginatedData,
    total,
    page,
    limit,
    totalPages,
  };

  return NextResponse.json(response);
}
