//B"H
import { getSearchIndex, saveSearchIndex, YEARS } from './modules/store.js';

const BUCKET_MONTHS = 'months-1764928230';
const BUCKET_DAYS = 'days-1764928230';
const ramIndexCache = new Map();

export const HEBREW_MONTHS = [
  { id: 1, name: 'Tishrei' }, { id: 2, name: 'Cheshvan' },
  { id: 3, name: 'Kislev' }, { id: 4, name: 'Teves' },
  { id: 5, name: 'Shevat' }, { id: 6, name: 'Adar' },
  { id: 7, name: 'Nissan' }, { id: 8, name: 'Iyar' },
  { id: 9, name: 'Sivan' }, { id: 10, name: 'Tammuz' },
  { id: 11, name: 'Menachem Av' }, { id: 12, name: 'Elul' }
];

/**
 * B"H
 * The Awtsmoos lets finite controls hold a living calendar without guessing.
 * @returns {{years:string[],months:{id:number,name:string}[],days:number[]}}
 */
export function getSearchOptions() {
  return {
    years: Object.keys(YEARS).sort((a, b) => Number(a) - Number(b)),
    months: HEBREW_MONTHS,
    days: Array.from({ length: 30 }, (_, i) => i + 1)
  };
}

/**
 * B"H
 * Search date indexes by building one union per dimension, then intersecting
 * dimensions. Keyword-only searches scan month indexes once, then title/filter
 * in RAM and IndexedDB, so the text search still has a real archive substrate.
 * @param {object|number|string} filters Search request or legacy month.
 * @param {number|string} legacyDay Legacy day.
 * @returns {Promise<object[]>} Sorted archive events.
 */
export async function searchArchive(filters = {}, legacyDay) {
  const request = normalizeSearchRequest(filters, legacyDay);
  const groups = await fetchSearchGroups(request);
  if (!groups.length) return [];
  const merged = groups.length === 1 ? groups[0] : intersect(groups);
  return unique(merged).filter(event => matchesRequest(event, request)).sort(compareEvents);
}

export async function primeSearchIndexes(onProgress = () => {}) {
  const jobs = [
    ...HEBREW_MONTHS.map(month => [BUCKET_MONTHS, `${month.id}.json`]),
    ...getSearchOptions().days.map(day => [BUCKET_DAYS, `${day}.json`])
  ];
  const out = [];
  for (let i = 0; i < jobs.length; i++) {
    const [bucket, filename] = jobs[i];
    out.push(await fetchIndex(bucket, filename));
    onProgress({ done: i + 1, total: jobs.length, bucket, filename });
  }
  return out.reduce((sum, events) => sum + events.length, 0);
}

export function normalizeSearchRequest(filters = {}, legacyDay) {
  const raw = typeof filters === 'object' && !Array.isArray(filters)
    ? filters
    : { month: filters, day: legacyDay };
  const options = getSearchOptions();
  const years = resolvePart(raw.year || raw.years, raw.yearRange, options.years.map(Number));
  const months = resolvePart(raw.month || raw.months, raw.monthRange, HEBREW_MONTHS.map(x => x.id));
  const days = resolvePart(raw.day || raw.days, raw.dayRange, options.days);
  return {
    years: years.map(String),
    months: months.map(Number),
    days: days.map(Number),
    keyword: normalizeKeyword(raw.keyword || raw.text || raw.q)
  };
}

async function fetchSearchGroups(request) {
  const groups = [];
  if (request.months.length) groups.push(await unionBucketEvents(BUCKET_MONTHS, request.months));
  if (request.days.length) groups.push(await unionBucketEvents(BUCKET_DAYS, request.days));
  if (!groups.length && (request.years.length || request.keyword)) {
    groups.push(await unionBucketEvents(BUCKET_MONTHS, HEBREW_MONTHS.map(x => x.id)));
  }
  return groups;
}

async function unionBucketEvents(bucket, values) {
  const buckets = await Promise.all(values.map(value => fetchIndex(bucket, `${value}.json`)));
  return unique(buckets.flat());
}

function resolvePart(value, explicitRange, allowed) {
  const range = looksRange(value) ? value : explicitRange;
  const exact = looksRange(value) ? '' : value;
  return resolveValues(exact, range, allowed);
}

function looksRange(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function resolveValues(exact, range, allowed) {
  const exactValues = list(exact).map(Number).filter(Number.isFinite);
  if (exactValues.length) return onlyAllowed(exactValues, allowed);
  const [from, to] = normalizeRange(range);
  if (from === null && to === null) return [];
  return allowed.filter(value => (from === null || value >= from) && (to === null || value <= to));
}

function normalizeRange(range) {
  if (!range) return [null, null];
  const from = Number(range.from ?? range.min ?? range.start ?? '');
  const to = Number(range.to ?? range.max ?? range.end ?? '');
  const a = Number.isFinite(from) ? from : null;
  const b = Number.isFinite(to) ? to : null;
  if (a !== null && b !== null && a > b) return [b, a];
  return [a, b];
}

function onlyAllowed(values, allowed) {
  const allowedSet = new Set(allowed.map(Number));
  return [...new Set(values)].filter(v => allowedSet.has(Number(v)));
}

function matchesRequest(event, request) {
  return inSetOrOpen(String(event.year), request.years)
    && inSetOrOpen(Number(event.month_id), request.months)
    && inSetOrOpen(Number(event.day), request.days)
    && matchesKeyword(event, request.keyword);
}

function matchesKeyword(event, keyword) {
  if (!keyword) return true;
  return haystack(event).includes(keyword);
}

function haystack(event) {
  return normalizeKeyword([
    event.title,
    event.folder,
    event.bucket,
    event.month,
    event.year,
    event.day
  ].filter(Boolean).join(' '));
}

function normalizeKeyword(value) {
  return String(value || '').toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function inSetOrOpen(value, values) {
  return !values.length || new Set(values).has(value);
}

function list(value) {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value.filter(x => x !== undefined && x !== null && x !== '') : [value];
}

function key(event) {
  return `${event.bucket || ''}::${event.folder || ''}`;
}

function intersect(groups) {
  let map = new Map(groups[0].map(event => [key(event), event]));
  groups.slice(1).forEach(group => {
    const keys = new Set(group.map(key));
    map = new Map([...map].filter(([k]) => keys.has(k)));
  });
  return [...map.values()];
}

function unique(events) {
  const out = [];
  const seen = new Set();
  events.forEach(event => {
    const k = key(event);
    if (!k.trim() || seen.has(k)) return;
    seen.add(k);
    out.push(event);
  });
  return out;
}

function compareEvents(a, b) {
  return (Number(a.year || 0) - Number(b.year || 0))
    || (Number(a.month_id || 0) - Number(b.month_id || 0))
    || (Number(a.day || 0) - Number(b.day || 0))
    || String(a.title || '').localeCompare(String(b.title || ''));
}

async function fetchIndex(bucket, filename) {
  const cacheKey = `${bucket}/${filename}`;
  if (ramIndexCache.has(cacheKey)) return ramIndexCache.get(cacheKey);
  try {
    const cached = await getSearchIndex(cacheKey);
    if (cached) {
      ramIndexCache.set(cacheKey, cached);
      return cached;
    }
  } catch {}
  try {
    const res = await fetch(`https://archive.org/download/${bucket}/${filename}`);
    if (!res.ok) return [];
    const data = await res.json();
    const events = Array.isArray(data.events) ? data.events : [];
    ramIndexCache.set(cacheKey, events);
    try { await saveSearchIndex(cacheKey, events); } catch {}
    return events;
  } catch (e) {
    console.error('Date index fetch failed', cacheKey, e);
    return [];
  }
}
