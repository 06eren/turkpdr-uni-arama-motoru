"use client";

import React, { useState } from 'react';
import {
  Search, SlidersHorizontal, X, ChevronDown, ChevronUp
} from 'lucide-react';

interface FilterOptions {
  puanTipleri: string[];
  sehirler: string[];
  universiteler: string[];
}

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  puanTipi: string;
  setPuanTipi: (pt: string) => void;
  sehir: string;
  setSehir: (s: string) => void;
  universite: string;
  setUniversite: (u: string) => void;
  programTuru: string;
  setProgramTuru: (t: string) => void;
  uyruk: string;
  setUyruk: (u: string) => void;
  siralama: string;
  setSiralama: (s: string) => void;
  siraMin: string;
  setSiraMin: (s: string) => void;
  siraMax: string;
  setSiraMax: (s: string) => void;
  puanMin: string;
  setPuanMin: (s: string) => void;
  puanMax: string;
  setPuanMax: (s: string) => void;
  yeniAcilan: boolean;
  setYeniAcilan: (v: boolean) => void;
  dolmamis: boolean;
  setDolmamis: (v: boolean) => void;
  okulBirincisi: boolean;
  setOkulBirincisi: (v: boolean) => void;
  depremzede: boolean;
  setDepremzede: (v: boolean) => void;
  sehitGazi: boolean;
  setSehitGazi: (v: boolean) => void;
  kadin34: boolean;
  setKadin34: (v: boolean) => void;
  onReset: () => void;
  filterOptions: FilterOptions | null;
  total: number;
}

const PROGRAM_TURLERI = [
  { value: '4_yillik',      label: 'Fakülte (4 Yıllık)',   sub: 'Lisans' },
  { value: 'yuksekokul',    label: 'Yüksekokul (Y.O.)',    sub: '4 Yıllık Lisans' },
  { value: 'ozel_yetenek',  label: 'Özel Yetenek',          sub: 'Fakülte / Y.O.' },
  { value: 'acikogretim_4', label: 'Açıköğretim (4Y)',     sub: 'Sadece Açıköğretim' },
  { value: 'uzaktan',       label: 'Uzaktan Eğitim',       sub: 'Açık + Uzaktan' },
];

const OZEL_KOSULLAR = [
  { key: 'yeniAcilan',    label: 'Yeni Açılan Bölümler' },
  { key: 'dolmamis',      label: 'Kontenjanı Dolmamış' },
  { key: 'okulBirincisi', label: 'Okul Birincisi' },
  { key: 'depremzede',    label: 'Depremzede Kontenjanı' },
  { key: 'sehitGazi',     label: 'Şehit / Gazi Yakını' },
  { key: 'kadin34',       label: '34 Yaş Üstü Kadın' },
];

function SelectBox({ label, value, onChange, disabled, children }: {
  label: string; value: string; onChange: (v: string) => void;
  disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-9 pl-3 pr-8 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:opacity-50"
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function ToggleChip({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-150 whitespace-nowrap ${
        active
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

export default function SearchFilters({
  searchQuery, setSearchQuery,
  puanTipi, setPuanTipi,
  sehir, setSehir,
  universite, setUniversite,
  programTuru, setProgramTuru,
  uyruk, setUyruk,
  siralama, setSiralama,
  siraMin, setSiraMin, siraMax, setSiraMax,
  puanMin, setPuanMin, puanMax, setPuanMax,
  yeniAcilan, setYeniAcilan,
  dolmamis, setDolmamis,
  okulBirincisi, setOkulBirincisi,
  depremzede, setDepremzede,
  sehitGazi, setSehitGazi,
  kadin34, setKadin34,
  onReset, filterOptions, total,
}: SearchFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    puanTipi, sehir, universite, programTuru, uyruk,
    yeniAcilan, dolmamis, okulBirincisi, depremzede, sehitGazi, kadin34,
    siraMin, siraMax, puanMin, puanMax,
  ].filter(Boolean).length;

  const kosulMap: Record<string, { get: boolean; set: (v: boolean) => void }> = {
    yeniAcilan:    { get: yeniAcilan,    set: setYeniAcilan },
    dolmamis:      { get: dolmamis,      set: setDolmamis },
    okulBirincisi: { get: okulBirincisi, set: setOkulBirincisi },
    depremzede:    { get: depremzede,    set: setDepremzede },
    sehitGazi:     { get: sehitGazi,     set: setSehitGazi },
    kadin34:       { get: kadin34,       set: setKadin34 },
  };

  return (
    <div className="bg-white border-b border-gray-100">
      {/* ── Ana Satır ─────────────────────────────────────────────── */}
      <div className="px-5 py-3 flex flex-wrap items-end gap-3">

        {/* Arama */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Üniversite, bölüm veya şehir ara..."
            className="w-full h-9 pl-9 pr-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Puan Türü */}
        <div className="w-28">
          <SelectBox label="Puan Türü" value={puanTipi} onChange={setPuanTipi} disabled={!filterOptions}>
            <option value="">Tümü</option>
            {filterOptions?.puanTipleri.map(pt => <option key={pt} value={pt}>{pt}</option>)}
          </SelectBox>
        </div>

        {/* Şehir */}
        <div className="w-40">
          <SelectBox label="Şehir" value={sehir} onChange={setSehir} disabled={!filterOptions}>
            <option value="">Tüm Şehirler</option>
            {filterOptions?.sehirler.map(s => <option key={s} value={s}>{s}</option>)}
          </SelectBox>
        </div>

        {/* Üniversite */}
        <div className="w-52">
          <SelectBox label="Üniversite" value={universite} onChange={setUniversite} disabled={!filterOptions}>
            <option value="">Tüm Üniversiteler</option>
            {filterOptions?.universiteler.map(u => <option key={u} value={u}>{u}</option>)}
          </SelectBox>
        </div>

        {/* Sıralama */}
        <div className="w-48">
          <SelectBox label="Sırala" value={siralama} onChange={setSiralama}>
            <option value="basari_sirasi">Başarı Sırasına Göre</option>
            <option value="taban_puani">Taban Puanına Göre</option>
            <option value="program_kodu">Program Koduna Göre</option>
          </SelectBox>
        </div>

        {/* Spacer + Sağ taraf */}
        <div className="flex items-end gap-2 ml-auto">
          {/* Toplam sayı */}
          <span className="text-sm font-semibold text-gray-500 whitespace-nowrap pb-0.5">
            <span className="text-gray-900 text-base">{total.toLocaleString('tr-TR')}</span> program
          </span>

          {/* Gelişmiş Filtreler */}
          <button
            onClick={() => setOpen(o => !o)}
            className={`flex items-center gap-1.5 h-9 px-3.5 rounded-lg border text-xs font-semibold transition-all ${
              open || activeCount > 0
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtreler
            {activeCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold">
                {activeCount}
              </span>
            )}
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Temizle */}
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 h-9 px-2.5 rounded-lg text-xs text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* ── Gelişmiş Panel ────────────────────────────────────────── */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/60">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-5">

            {/* Program Türü */}
            <div className="xl:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Program Türü</p>
              <div className="flex flex-wrap gap-1.5">
                <ToggleChip active={programTuru === ''} onClick={() => setProgramTuru('')}>Tümü</ToggleChip>
                {PROGRAM_TURLERI.map(pt => (
                  <ToggleChip
                    key={pt.value}
                    active={programTuru === pt.value}
                    onClick={() => setProgramTuru(programTuru === pt.value ? '' : pt.value)}
                  >
                    {pt.label}
                  </ToggleChip>
                ))}
              </div>
            </div>

            {/* Uyruk */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Uyruk</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: '',     label: 'Tümü' },
                  { value: 'tc',   label: 'T.C. Uyruklu' },
                  { value: 'kktc', label: 'KKTC Uyruklu' },
                ].map(opt => (
                  <ToggleChip key={opt.value} active={uyruk === opt.value} onClick={() => setUyruk(opt.value)}>
                    {opt.label}
                  </ToggleChip>
                ))}
              </div>
            </div>

            {/* Özel Koşullar */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Özel Koşullar</p>
              <div className="flex flex-wrap gap-1.5">
                {OZEL_KOSULLAR.map(({ key, label }) => (
                  <ToggleChip
                    key={key}
                    active={kosulMap[key].get}
                    onClick={() => kosulMap[key].set(!kosulMap[key].get)}
                  >
                    {label}
                  </ToggleChip>
                ))}
              </div>
            </div>

            {/* Sıralama Aralığı */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Sıralama Aralığı</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="En iyi"
                  value={siraMin}
                  onChange={e => setSiraMin(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
                <span className="text-gray-300 text-sm shrink-0">—</span>
                <input
                  type="number"
                  placeholder="En düşük"
                  value={siraMax}
                  onChange={e => setSiraMax(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {/* Puan Aralığı */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Taban Puan Aralığı</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.001"
                  placeholder="En az"
                  value={puanMin}
                  onChange={e => setPuanMin(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
                <span className="text-gray-300 text-sm shrink-0">—</span>
                <input
                  type="number"
                  step="0.001"
                  placeholder="En fazla"
                  value={puanMax}
                  onChange={e => setPuanMax(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
