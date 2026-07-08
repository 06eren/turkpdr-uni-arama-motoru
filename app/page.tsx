"use client";

import React, { useState, useEffect } from 'react';
import SearchFilters from '@/components/SearchFilters';
import UniversityTable from '@/components/UniversityTable';
import { UniversityProgram, PaginatedResponse } from '@/types/university';

export default function Home() {
  const [data, setData] = useState<UniversityProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOptions, setFilterOptions] = useState(null);

  // Temel filtreler
  const [searchQuery, setSearchQuery] = useState('');
  const [puanTipi, setPuanTipi] = useState('');
  const [sehir, setSehir] = useState('');
  const [universite, setUniversite] = useState('');
  const [siralama, setSiralama] = useState('basari_sirasi');

  // Gelişmiş filtreler
  const [programTuru, setProgramTuru] = useState('');
  const [universiteTuru, setUniversiteTuru] = useState('');
  const [uyruk, setUyruk] = useState('');
  const [siraMin, setSiraMin] = useState('');
  const [siraMax, setSiraMax] = useState('');
  const [puanMin, setPuanMin] = useState('');
  const [puanMax, setPuanMax] = useState('');
  const [yeniAcilan, setYeniAcilan] = useState(false);
  const [dolmamis, setDolmamis] = useState(false);
  const [okulBirincisi, setOkulBirincisi] = useState(false);
  const [depremzede, setDepremzede] = useState(false);
  const [sehitGazi, setSehitGazi] = useState(false);
  const [kadin34, setKadin34] = useState(false);

  // Yeni Filtreler
  const [burs, setBurs] = useState('');
  const [dil, setDil] = useState('');
  const [kibris, setKibris] = useState(false);
  const [mtok, setMtok] = useState(false);
  const [akreditasyon, setAkreditasyon] = useState(false);

  // Debounced arama
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Debounced aralıklar
  const [dSiraMin, setDSiraMin] = useState('');
  const [dSiraMax, setDSiraMax] = useState('');
  const [dPuanMin, setDPuanMin] = useState('');
  const [dPuanMax, setDPuanMax] = useState('');
  useEffect(() => { const t = setTimeout(() => setDSiraMin(siraMin), 600); return () => clearTimeout(t); }, [siraMin]);
  useEffect(() => { const t = setTimeout(() => setDSiraMax(siraMax), 600); return () => clearTimeout(t); }, [siraMax]);
  useEffect(() => { const t = setTimeout(() => setDPuanMin(puanMin), 600); return () => clearTimeout(t); }, [puanMin]);
  useEffect(() => { const t = setTimeout(() => setDPuanMax(puanMax), 600); return () => clearTimeout(t); }, [puanMax]);

  // Filter options (1 kere)
  useEffect(() => {
    fetch('/api/universities/filters').then(r => r.json()).then(setFilterOptions).catch(console.error);
  }, []);

  // Sayfa sıfırlama
  const filterDeps = [debouncedSearch, puanTipi, sehir, universite, programTuru, uyruk,
    dSiraMin, dSiraMax, dPuanMin, dPuanMax,
    yeniAcilan, dolmamis, okulBirincisi, depremzede, sehitGazi, kadin34, siralama,
    burs, dil, kibris, mtok, akreditasyon];
  useEffect(() => { setPage(1); }, filterDeps); // eslint-disable-line react-hooks/exhaustive-deps

  // Data fetch
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const p = new URLSearchParams({ page: page.toString(), limit: '50' });
        if (debouncedSearch) p.append('q', debouncedSearch);
        if (puanTipi) p.append('puan_tipi', puanTipi);
        if (sehir) p.append('sehir', sehir);
        if (universite) p.append('universite', universite);
        if (programTuru) p.append('program_turu', programTuru);
        if (uyruk) p.append('uyruk', uyruk);
        if (dSiraMin) p.append('sira_min', dSiraMin);
        if (dSiraMax) p.append('sira_max', dSiraMax);
        if (dPuanMin) p.append('puan_min', dPuanMin);
        if (dPuanMax) p.append('puan_max', dPuanMax);
        if (yeniAcilan) p.append('yeni_acilan', '1');
        if (dolmamis) p.append('dolmamis', '1');
        if (okulBirincisi) p.append('okul_birincisi', '1');
        if (depremzede) p.append('depremzede', '1');
        if (sehitGazi) p.append('sehit_gazi', '1');
        if (kadin34) p.append('kadin_34', '1');
        if (burs) p.append('burs', burs);
        if (dil) p.append('dil', dil);
        if (kibris) p.append('kibris', '1');
        if (mtok) p.append('mtok', '1');
        if (akreditasyon) p.append('akreditasyon', '1');
        if (universiteTuru) p.append('universite_turu', universiteTuru);
        p.append('siralama', siralama);

        const res = await fetch(`/api/universities?${p}`);
        const json: PaginatedResponse<UniversityProgram> = await res.json();
        if (!cancelled) {
          setData(json.data);
          setTotal(json.total);
          setTotalPages(json.totalPages);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [page, debouncedSearch, puanTipi, sehir, universite, programTuru, universiteTuru, uyruk,
      dSiraMin, dSiraMax, dPuanMin, dPuanMax,
      yeniAcilan, dolmamis, okulBirincisi, depremzede, sehitGazi, kadin34, siralama,
      burs, dil, kibris, mtok, akreditasyon]);

  const handleReset = () => {
    setSearchQuery(''); setPuanTipi(''); setSehir(''); setUniversite('');
    setProgramTuru(''); setUniversiteTuru(''); setUyruk(''); setSiraMin(''); setSiraMax('');
    setPuanMin(''); setPuanMax('');
    setYeniAcilan(false); setDolmamis(false); setOkulBirincisi(false);
    setDepremzede(false); setSehitGazi(false); setKadin34(false);
    setBurs(''); setDil(''); setKibris(false); setMtok(false); setAkreditasyon(false);
    setSiralama('basari_sirasi'); setPage(1);
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <SearchFilters
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        puanTipi={puanTipi} setPuanTipi={setPuanTipi}
        sehir={sehir} setSehir={setSehir}
        universite={universite} setUniversite={setUniversite}
        programTuru={programTuru} setProgramTuru={setProgramTuru}
        universiteTuru={universiteTuru} setUniversiteTuru={setUniversiteTuru}
        uyruk={uyruk} setUyruk={setUyruk}
        siralama={siralama} setSiralama={setSiralama}
        siraMin={siraMin} setSiraMin={setSiraMin}
        siraMax={siraMax} setSiraMax={setSiraMax}
        puanMin={puanMin} setPuanMin={setPuanMin}
        puanMax={puanMax} setPuanMax={setPuanMax}
        yeniAcilan={yeniAcilan} setYeniAcilan={setYeniAcilan}
        dolmamis={dolmamis} setDolmamis={setDolmamis}
        okulBirincisi={okulBirincisi} setOkulBirincisi={setOkulBirincisi}
        depremzede={depremzede} setDepremzede={setDepremzede}
        sehitGazi={sehitGazi} setSehitGazi={setSehitGazi}
        kadin34={kadin34} setKadin34={setKadin34}
        burs={burs} setBurs={setBurs}
        dil={dil} setDil={setDil}
        kibris={kibris} setKibris={setKibris}
        mtok={mtok} setMtok={setMtok}
        akreditasyon={akreditasyon} setAkreditasyon={setAkreditasyon}
        onReset={handleReset}
        filterOptions={filterOptions}
        total={total}
      />

      <div className="flex-1 p-4">
        <UniversityTable
          data={data}
          isLoading={isLoading}
          page={page}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </main>
  );
}
