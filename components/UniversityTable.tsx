"use client";

import React from 'react';
import { UniversityProgram } from '@/types/university';

interface UniversityTableProps {
  data: UniversityProgram[];
  isLoading: boolean;
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function UniversityTable({
  data, isLoading, page, total, totalPages, onPageChange
}: UniversityTableProps) {

  if (!isLoading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-gray-100 rounded-xl">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Sonuç Bulunamadı</h3>
        <p className="text-sm text-gray-400 max-w-xs">Arama kriterlerinize uygun program bulunamadı. Lütfen filtreleri değiştirip tekrar deneyin.</p>
      </div>
    );
  }

  const start = (page - 1) * 50 + 1;
  const end = Math.min(page * 50, total);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-none">
      {/* Table */}
      <div className="overflow-x-auto relative print-area" style={{ minHeight: isLoading ? 400 : 'auto' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-9 w-9 border-2 border-gray-100 border-t-blue-600" />
              <span className="text-xs text-gray-400">Yükleniyor...</span>
            </div>
          </div>
        )}

        <table className="w-full text-sm text-left border-collapse whitespace-nowrap print:whitespace-normal print:text-xs">
          <thead>
            {/* Group row */}
            <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="px-3 py-2 border-r border-gray-100" rowSpan={2}>NO</th>
              <th className="px-3 py-2 border-r border-gray-100" rowSpan={2}>PRG KODU</th>
              <th className="px-3 py-2 border-r border-gray-100" rowSpan={2}>TÜR</th>
              <th className="px-3 py-2 border-r border-gray-100 min-w-[190px]" rowSpan={2}>ÜNİVERSİTE / ŞEHİR</th>
              <th className="px-3 py-2 border-r border-gray-100 min-w-[240px]" rowSpan={2}>BÖLÜM / FAKÜLTE</th>
              <th className="px-3 py-2 border-r border-gray-100 text-center" rowSpan={2}>YIL</th>
              <th className="px-3 py-2 border-r border-gray-100 text-center text-blue-600 bg-blue-50/80" colSpan={3}>BAŞARI SIRASI</th>
              <th className="px-3 py-2 border-r border-gray-100 text-center text-emerald-600 bg-emerald-50/80" colSpan={3}>TABAN PUANI</th>
              <th className="px-3 py-2 text-center text-purple-600 bg-purple-50/80" colSpan={4}>KONTENJAN</th>
            </tr>
            <tr className="bg-gray-50 text-[10px] font-semibold text-gray-400 border-b-2 border-gray-200">
              <th className="px-3 py-2 text-center bg-blue-50/50 text-blue-600">2025</th>
              <th className="px-3 py-2 text-center bg-blue-50/30">2024</th>
              <th className="px-3 py-2 border-r border-gray-100 text-center bg-blue-50/10">2023</th>
              <th className="px-3 py-2 text-center bg-emerald-50/50 text-emerald-600">2025</th>
              <th className="px-3 py-2 text-center bg-emerald-50/30">2024</th>
              <th className="px-3 py-2 border-r border-gray-100 text-center bg-emerald-50/10">2023</th>
              <th className="px-3 py-2 text-center bg-purple-50/50 text-purple-600">25 GNL</th>
              <th className="px-3 py-2 text-center bg-purple-50/30">24 GNL</th>
              <th className="px-3 py-2 text-center bg-purple-50/10">23 GNL</th>
              <th className="px-3 py-2 text-center bg-purple-50/50 text-purple-600">25 YER</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr
                key={`${item.program_kodu}-${idx}`}
                className="border-b border-gray-50 hover:bg-blue-50/40 hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:-translate-y-[1px] relative z-0 hover:z-10 transition-all duration-300 ease-out group"
              >
                <td className="px-3 py-2.5 text-xs text-gray-400 border-r border-gray-50">{item.sira_no}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-gray-500 border-r border-gray-50">{item.program_kodu}</td>
                <td className="px-3 py-2.5 border-r border-gray-50">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 tracking-wide">
                    {item.puan_tipi}
                  </span>
                </td>
                <td className="px-3 py-2.5 border-r border-gray-50">
                  <div className="font-semibold text-gray-900 text-xs leading-tight">{item.universite}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-gray-500 font-medium">{item.sehir}</span>
                    {item.universite_turu && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-semibold tracking-wide">
                        {item.universite_turu}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 border-r border-gray-50 whitespace-normal max-w-[280px]">
                  <div className="font-medium text-blue-700 text-xs leading-tight">{item.bolum_program}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 mb-1">{item.fakulte}</div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {item.ucret_burs && item.ucret_burs !== 'Ücretli' && (
                      <span className="inline-flex px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded text-[9px] font-bold">
                        {item.ucret_burs}
                      </span>
                    )}
                    {item.ucret_burs === 'Ücretli' && (
                      <span className="inline-flex px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[9px] font-bold">
                        {item.ucret_burs}
                      </span>
                    )}
                    {item.egitim_dili && item.egitim_dili !== 'Türkçe' && (
                      <span className="inline-flex px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-bold">
                        {item.egitim_dili}
                      </span>
                    )}
                    {item.program_turu && item.program_turu !== 'LİSANS' && (
                      <span className="inline-flex px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[9px] font-bold">
                        {item.program_turu}
                      </span>
                    )}
                    {item.ek_bilgi && item.ek_bilgi !== '*' && (
                      <span className="inline-flex px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-medium">
                        {item.ek_bilgi}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center text-xs text-gray-500 border-r border-gray-50">{item.sure_yil}</td>

                {/* Başarı Sırası */}
                <td className="px-3 py-2.5 text-center text-xs font-semibold text-blue-700 bg-blue-50/10 group-hover:bg-transparent">
                  {item.basari_sirasi_2025 === '-' ? <span className="text-gray-300">—</span> : item.basari_sirasi_2025}
                </td>
                <td className="px-3 py-2.5 text-center text-xs text-gray-500 bg-blue-50/5 group-hover:bg-transparent">
                  {item.basari_sirasi_2024 === '-' ? <span className="text-gray-300">—</span> : item.basari_sirasi_2024}
                </td>
                <td className="px-3 py-2.5 text-center text-xs text-gray-400 border-r border-gray-50 group-hover:bg-transparent">
                  {item.basari_sirasi_2023 === '-' ? <span className="text-gray-300">—</span> : item.basari_sirasi_2023}
                </td>

                {/* Taban Puanı */}
                <td className="px-3 py-2.5 text-center text-xs font-semibold text-emerald-700 bg-emerald-50/10 group-hover:bg-transparent">
                  {item.taban_puani_2025 === '-' ? <span className="text-gray-300">—</span> : item.taban_puani_2025}
                </td>
                <td className="px-3 py-2.5 text-center text-xs text-gray-500 bg-emerald-50/5 group-hover:bg-transparent">
                  {item.taban_puani_2024 === '-' ? <span className="text-gray-300">—</span> : item.taban_puani_2024}
                </td>
                <td className="px-3 py-2.5 text-center text-xs text-gray-400 border-r border-gray-50 group-hover:bg-transparent">
                  {item.taban_puani_2023 === '-' ? <span className="text-gray-300">—</span> : item.taban_puani_2023}
                </td>

                {/* Kontenjan */}
                <td className="px-3 py-2.5 text-center text-xs font-bold text-purple-700 bg-purple-50/10 group-hover:bg-transparent">{item.kontenjan_2025_genel}</td>
                <td className="px-3 py-2.5 text-center text-xs text-gray-500 group-hover:bg-transparent">{item.kontenjan_2024_genel}</td>
                <td className="px-3 py-2.5 text-center text-xs text-gray-400 group-hover:bg-transparent">{item.kontenjan_2023_genel}</td>
                <td className="px-3 py-2.5 text-center text-xs font-bold text-purple-600 group-hover:bg-transparent">{item.kontenjan_2025_yrlsn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50/50 flex-wrap gap-3 print:hidden">
        <div className="text-xs text-gray-500">
          {total > 0 ? (
            <><span className="font-semibold text-gray-800">{start.toLocaleString('tr-TR')}–{end.toLocaleString('tr-TR')}</span> / toplam <span className="font-semibold text-gray-800">{total.toLocaleString('tr-TR')}</span> program</>
          ) : 'Sonuç yok'}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onPageChange(1)} disabled={page === 1}
            className="px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            «
          </button>
          <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
            className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Önceki
          </button>

          {/* Page numbers */}
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button key={p} onClick={() => onPageChange(p)}
                  className={`w-7 h-7 text-xs rounded font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                  {p}
                </button>
              );
            })}
          </div>

          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
            className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Sonraki
          </button>
          <button onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}
            className="px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            »
          </button>
        </div>
      </div>
    </div>
  );
}
