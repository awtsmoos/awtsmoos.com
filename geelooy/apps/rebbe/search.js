//B"H
import { getSearchIndex, saveSearchIndex, YEARS } from './modules/store.js';

const BUCKET_MONTHS = "months-1764928230";
const BUCKET_DAYS = "days-1764928230";

export const HEBREW_MONTHS = [
  {id:1,name:'Tishrei'},{id:2,name:'Cheshvan'},{id:3,name:'Kislev'},
  {id:4,name:'Teves'},{id:5,name:'Shevat'},{id:6,name:'Adar'},
  {id:7,name:'Nissan'},{id:8,name:'Iyar'},{id:9,name:'Sivan'},
  {id:10,name:'Tammuz'},{id:11,name:'Menachem Av'},{id:12,name:'Elul'}
];

export function getSearchOptions() {
  return { years:Object.keys(YEARS).sort((a,b)=>Number(a)-Number(b)), months:HEBREW_MONTHS, days:Array.from({length:30},(_,i)=>i+1) };
}

export async function searchArchive(filters = {}, legacyDay) {
  if (typeof filters !== 'object' || Array.isArray(filters)) filters = { month: filters, day: legacyDay };

  const years = list(filters.year || filters.years).map(String);
  const months = list(filters.month || filters.months).map(Number).filter(Boolean);
  const days = list(filters.day || filters.days).map(Number).filter(Boolean);
  const requests = [];
  let unionMode = false;

  for (const m of months) requests.push(fetchIndex(BUCKET_MONTHS, `${m}.json`));
  for (const d of days) requests.push(fetchIndex(BUCKET_DAYS, `${d}.json`));

  if (!requests.length) {
    if (!years.length) return [];
    unionMode = true;
    for (let m = 1; m <= 12; m++) requests.push(fetchIndex(BUCKET_MONTHS, `${m}.json`));
  }

  const buckets = await Promise.all(requests);
  let results = unionMode ? buckets.flat() : intersect(buckets);

  if (years.length) {
    const set = new Set(years);
    results = results.filter(e => set.has(String(e.year)));
  }
  if (months.length) {
    const set = new Set(months);
    results = results.filter(e => set.has(Number(e.month_id)));
  }
  if (days.length) {
    const set = new Set(days);
    results = results.filter(e => set.has(Number(e.day)));
  }

  return unique(results).sort((a,b) =>
    (Number(a.year||0)-Number(b.year||0)) ||
    (Number(a.month_id||0)-Number(b.month_id||0)) ||
    (Number(a.day||0)-Number(b.day||0)) ||
    String(a.title||'').localeCompare(String(b.title||''))
  );
}

function list(v) {
  if (v === undefined || v === null || v === '') return [];
  return Array.isArray(v) ? v.filter(x => x !== undefined && x !== null && x !== '') : [v];
}

function key(e) { return `${e.bucket || ''}::${e.folder || ''}`; }

function intersect(buckets) {
  const clean = buckets.filter(b => Array.isArray(b) && b.length);
  if (!clean.length) return [];
  let map = new Map(clean[0].map(e => [key(e), e]));
  for (const bucket of clean.slice(1)) {
    const keys = new Set(bucket.map(key));
    map = new Map([...map].filter(([k]) => keys.has(k)));
  }
  return [...map.values()];
}

function unique(events) {
  const out = [], seen = new Set();
  for (const e of events) {
    const k = key(e);
    if (!k.trim() || seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out;
}

async function fetchIndex(bucket, filename) {
  const cacheKey = `${bucket}/${filename}`;
  try {
    const cached = await getSearchIndex(cacheKey);
    if (cached) return cached;
  } catch {}
  try {
    const res = await fetch(`https://archive.org/download/${bucket}/${filename}`);
    if (!res.ok) return [];
    const data = await res.json();
    const events = Array.isArray(data.events) ? data.events : [];
    try { await saveSearchIndex(cacheKey, events); } catch {}
    return events;
  } catch (e) {
    console.error("Date index fetch failed", cacheKey, e);
    return [];
  }
}
