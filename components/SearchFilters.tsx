"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Printer } from 'lucide-react';

interface FilterOptions {
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
  universiteTuru: string;
  setUniversiteTuru: (t: string) => void;
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
  burs: string;
  setBurs: (s: string) => void;
  dil: string;
  setDil: (s: string) => void;
  kibris: boolean;
  setKibris: (v: boolean) => void;
  mtok: boolean;
  setMtok: (v: boolean) => void;
  akreditasyon: boolean;
  setAkreditasyon: (v: boolean) => void;
  onReset: () => void;
  filterOptions: FilterOptions | null;
  total: number;
}

const PUAN_TURLERI = [
  { value: 'SAY', label: 'SAY' },
  { value: 'SÖZ', label: 'SÖZ' },
  { value: 'EA', label: 'EA' },
  { value: 'DİL', label: 'DİL' },
  { value: 'TYT', label: 'TYT' },
];

const PROGRAM_TURLERI = [
  { value: 'LISANS', label: 'LİSANS' },
  { value: 'ÖNLİSANS', label: 'ÖNLİSANS' },
];

const UNIVERSITE_TURLERI = [
  { value: 'DEVLET', label: 'DEVLET' },
  { value: 'VAKIF', label: 'VAKIF' },
  { value: 'KKTC', label: 'KKTC' },
  { value: 'YURTDISI VAKIF', label: 'YURTDIŞI VAKIF' },
  { value: 'VAKIF MYO', label: 'VAKIF MYO' },
  { value: 'YURTDISI KAMU', label: 'YURTDIŞI KAMU' },
];

const OZEL_KOSULLAR = [
  { key: 'yeniAcilan',    label: 'Yeni Açılan Bölümler' },
  { key: 'dolmamis',      label: 'Kontenjanı Dolmamış' },
  { key: 'okulBirincisi', label: 'Okul Birincisi' },
  { key: 'depremzede',    label: 'Depremzede Kontenjanı' },
  { key: 'sehitGazi',     label: 'Şehit / Gazi Yakını' },
  { key: 'kadin34',       label: '34 Yaş Üstü Kadın' },
  { key: 'mtok',          label: 'M.T.O.K.' },
  { key: 'akreditasyon',  label: 'Akreditasyonlu' },
  { key: 'kibris',        label: 'KKTC Üniversiteleri' },
];

function MultiSelectDropdown({ label, options, selectedValues, onChange }: {
  label: string; options: {value: string, label: string}[]; selectedValues: string; onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedArray = selectedValues ? selectedValues.split(',') : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleVal = (val: string) => {
    if (selectedArray.includes(val)) {
      onChange(selectedArray.filter(v => v !== val).join(','));
    } else {
      onChange([...selectedArray, val].join(','));
    }
  };

  return (
    <div className="flex flex-col gap-1 min-w-0 relative" ref={containerRef}>
      <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-9 px-3 text-left text-sm text-gray-800 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 flex items-center justify-between"
        >
          <span className="truncate pr-2">{selectedArray.length > 0 ? `${selectedArray.length} seçildi` : 'Tümü'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </button>
        {isOpen && (
          <div className="absolute z-20 w-[200px] mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto left-0 animate-dropdown origin-top ring-1 ring-black/5">
            <div className="p-1">
              {options.map(opt => (
                <label key={opt.value} className="flex items-center gap-2.5 px-2.5 py-2 text-sm hover:bg-blue-50/50 rounded-lg cursor-pointer transition-colors group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={selectedArray.includes(opt.value)} onChange={() => toggleVal(opt.value)} className="appearance-none w-4 h-4 rounded border border-gray-300 checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer group-hover:border-blue-400" />
                    {selectedArray.includes(opt.value) && (
                      <svg className="w-2.5 h-2.5 text-white absolute pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 group-hover:text-blue-900 transition-colors font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-200 active:scale-95 whitespace-nowrap ${
        active
          ? 'bg-blue-600 text-white border-blue-600 shadow-md transform -translate-y-[1px]'
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm hover:-translate-y-[1px] hover:text-blue-700'
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
  universiteTuru, setUniversiteTuru,
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
  burs, setBurs,
  dil, setDil,
  kibris, setKibris,
  mtok, setMtok,
  akreditasyon, setAkreditasyon,
  onReset, filterOptions, total,
}: SearchFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    puanTipi, sehir, universite, programTuru, universiteTuru, uyruk,
    yeniAcilan, dolmamis, okulBirincisi, depremzede, sehitGazi, kadin34,
    burs, dil, kibris, mtok, akreditasyon,
    siraMin, siraMax, puanMin, puanMax,
  ].filter(Boolean).length;

  const kosulMap: Record<string, { get: boolean; set: (v: boolean) => void }> = {
    yeniAcilan:    { get: yeniAcilan,    set: setYeniAcilan },
    dolmamis:      { get: dolmamis,      set: setDolmamis },
    okulBirincisi: { get: okulBirincisi, set: setOkulBirincisi },
    depremzede:    { get: depremzede,    set: setDepremzede },
    sehitGazi:     { get: sehitGazi,     set: setSehitGazi },
    kadin34:       { get: kadin34,       set: setKadin34 },
    mtok:          { get: mtok,          set: setMtok },
    akreditasyon:  { get: akreditasyon,  set: setAkreditasyon },
    kibris:        { get: kibris,        set: setKibris },
  };

  return (
    <div className="bg-white border-b border-gray-100 relative z-10">
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
          <MultiSelectDropdown label="Puan Türü" options={PUAN_TURLERI} selectedValues={puanTipi} onChange={setPuanTipi} />
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
          <span className="text-sm font-semibold text-gray-500 whitespace-nowrap pb-0.5">
            <span className="text-gray-900 text-base">{total.toLocaleString('tr-TR')}</span> program
          </span>

          <button
            onClick={() => setOpen(o => !o)}
            className={`flex items-center gap-1.5 h-9 px-3.5 rounded-lg border text-xs font-semibold transition-all shadow-sm active:scale-95 print:hidden ${
              open || activeCount > 0
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtreler
            {activeCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold">
                {activeCount}
              </span>
            )}
            {open ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>

          {/* Yazdır Butonu */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border text-xs font-semibold bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-blue-600 transition-all shadow-sm active:scale-95 print:hidden"
            title="Tabloyu Yazdır"
          >
            <Printer className="w-3.5 h-3.5" />
            Yazdır
          </button>

          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 h-9 px-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all print:hidden active:scale-95"
            >
              <X className="w-4 h-4" />
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* ── Gelişmiş Panel ────────────────────────────────────────── */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-5 bg-gradient-to-b from-gray-50/80 to-white relative z-0 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-6">

            <div className="flex gap-4">
               <div className="w-full">
                  <MultiSelectDropdown label="Ön Lisans / Lisans" options={PROGRAM_TURLERI} selectedValues={programTuru} onChange={setProgramTuru} />
               </div>
               <div className="w-full">
                  <MultiSelectDropdown label="Üniversite Türü" options={UNIVERSITE_TURLERI} selectedValues={universiteTuru} onChange={setUniversiteTuru} />
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
            <div className="xl:col-span-2">
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

            {/* Eğitim Dili */}
            <div className="xl:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Eğitim Dili</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: '', label: 'Tümü' },
                  { value: 'İngilizce', label: 'İngilizce' },
                  { value: 'Arapça', label: 'Arapça' },
                  { value: 'Almanca', label: 'Almanca' },
                  { value: 'Fransızca', label: 'Fransızca' },
                ].map(opt => (
                  <ToggleChip key={opt.value} active={dil === opt.value} onClick={() => setDil(opt.value)}>
                    {opt.label}
                  </ToggleChip>
                ))}
              </div>
            </div>

            {/* Burs Durumu */}
            <div className="xl:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Burs Durumu</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: '', label: 'Tümü' },
                  { value: 'tam_burslu', label: 'Tam Burslu' },
                  { value: 'indirimli_50', label: '%50 İndirimli' },
                  { value: 'indirimli_25', label: '%25 İndirimli' },
                  { value: 'ucretli', label: 'Ücretli' },
                ].map(opt => (
                  <ToggleChip key={opt.value} active={burs === opt.value} onClick={() => setBurs(opt.value)}>
                    {opt.label}
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
