import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { UniversityProgram } from '@/types/university';

let cachedData: UniversityProgram[] | null = null;
let cachedFilters: any = null;

async function getUniversitiesData() {
  if (cachedData) return cachedData;
  try {
    const filePath = path.join(process.cwd(), 'universiteler.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    cachedData = JSON.parse(fileContents);
    return cachedData;
  } catch (error) {
    console.error('Error reading universiteler.json:', error);
    return [];
  }
}

export async function GET() {
  if (cachedFilters) {
    return NextResponse.json(cachedFilters);
  }

  const data = await getUniversitiesData();
  
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Data not found' }, { status: 500 });
  }

  const puanTipleri = new Set<string>();
  const sehirler = new Set<string>();
  const universiteler = new Set<string>();

  data.forEach((item) => {
    if (item.puan_tipi && item.puan_tipi !== '*') puanTipleri.add(item.puan_tipi);
    if (item.sehir && item.sehir !== '*') sehirler.add(item.sehir);
    if (item.universite && item.universite !== '*') universiteler.add(item.universite);
  });

  cachedFilters = {
    puanTipleri: Array.from(puanTipleri).sort(),
    sehirler: Array.from(sehirler).sort(),
    universiteler: Array.from(universiteler).sort(),
  };

  return NextResponse.json(cachedFilters);
}
