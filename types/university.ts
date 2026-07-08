export interface UniversityProgram {
  sira_no: string;
  program_kodu: string;
  puan_tipi: string;
  universite: string;
  sehir: string;
  bolum_program: string;
  fakulte: string;
  ek_bilgi: string;
  sure_yil: string;
  basari_sirasi_2025: string;
  basari_sirasi_2024: string;
  basari_sirasi_2023: string;
  taban_puani_2025: string;
  taban_puani_2024: string;
  taban_puani_2023: string;
  kontenjan_2025_genel: string;
  kontenjan_2024_genel: string;
  kontenjan_2023_genel: string;
  kontenjan_2025_yrlsn: string;
  ozel_kosullar: string;
  akreditasyon: string;
  tyc_durumu: string;
  program_id: string;
  universite_turu: string;
  program_turu: string;
  egitim_dili: string;
  ucret_burs: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
