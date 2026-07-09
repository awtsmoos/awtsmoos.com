// B"H
/**
 * Import Sichos Kodesh parsed Firestore export into real Geelooy social series.
 * Writes normal series/post paths only; no custom side format.
 */
const fs = require('fs');
const DosDB = require('../../ayzarim/DosDB/index.js');
const DB_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const SOURCE = '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-parsed/Sichos Kodesh.parsed.json';
const REPORT_DIR = '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-social-import';
const APPLY = process.argv.includes('--apply');
const SAMPLE_ONLY = process.argv.includes('--sample');
const HEICHEL = 'ikar';
const AUTHOR = 'theRebbe';
const ROOT_PARENT = 'chassidus';
const PARENT = 'sichosKodesh';
function now() { return Date.now(); }
function cleanText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function hash(text) { let h = 2166136261; for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0'); }
const heb = { א:1, ב:2, ג:3, ד:4, ה:5, ו:6, ז:7, ח:8, ט:9, י:10, כ:20, ך:20, ל:30, מ:40, ם:40, נ:50, ן:50, ס:60, ע:70, פ:80, ף:80, צ:90, ץ:90, ק:100, ר:200, ש:300, ת:400 };
function yearFromTitle(title) {
  const m = String(title || '').match(/ה['׳]?תש[א-ת"״׳']{1,4}/);
  if (!m) return null;
  let n = 5000;
  for (const ch of m[0].replace(/^ה['׳]?/, '')) n += heb[ch] || 0;
  return n > 5600 && n < 5900 ? n : null;
}
function fixedYear(fields) { const y = Number(fields.hebrewYear); return y && y !== 5700 ? y : (yearFromTitle(fields.title) || y || 'unknown'); }
function fixedDate(fields) { const y = fixedYear(fields); const raw = String(fields.sortableDate || ''); return raw.startsWith('5700') && typeof y === 'number' ? Number(String(y) + raw.slice(4)) : (Number(fields.sortableDate) || 0); }
function postIdOf(id, fields) { return `sichosKodesh_${fixedYear(fields)}_${String(fixedDate(fields) || 'date')}_${hash(id + fields.title)}`; }
function yearSeriesId(year) { return `sichosKodesh${year || 'unknown'}`; }
function seriesBase(seriesId) { return `/social/heichelos/${HEICHEL}/series/${seriesId}`; }
function postsPath(seriesId) { return `${seriesBase(seriesId)}/posts`; }
function prateemPath(seriesId) { return `${seriesBase(seriesId)}/prateem`; }
function subSeriesPath(seriesId) { return `${seriesBase(seriesId)}/subSeries`; }
async function get(db, p, fallback = null) { try { const v = await db.get(p); return v ?? fallback; } catch { return fallback; } }
async function write(db, p, v) { if (APPLY) await db.write(p, v); }
async function ensureSeries(db, { id, name, description, parentSeriesId }) {
  const existing = await get(db, prateemPath(id));
  const prateem = existing && typeof existing === 'object' && !Buffer.isBuffer(existing) ? { ...existing, id, name: existing.name || name, description: existing.description ?? description, parentSeriesId: existing.parentSeriesId || parentSeriesId, updatedAt: now() } : { id, name, description, author: AUTHOR, parentSeriesId, createdAt: now() };
  await write(db, prateemPath(id), prateem);
  const sub = await get(db, subSeriesPath(id), []);
  await write(db, subSeriesPath(id), Array.isArray(sub) ? sub : []);
  const posts = await get(db, postsPath(id), {});
  await write(db, postsPath(id), posts && typeof posts === 'object' && !Array.isArray(posts) && !Buffer.isBuffer(posts) ? posts : {});
  const parentSub = await get(db, subSeriesPath(parentSeriesId), []);
  if (Array.isArray(parentSub) && !parentSub.includes(id)) await write(db, subSeriesPath(parentSeriesId), [...parentSub, id]);
}
function sectionFromParagraph(p) { return (p.subsections || []).map(s => cleanText(s.text)).filter(Boolean); }
function footnoteMap(parsedFootnotes) {
  const out = {};
  for (const f of parsedFootnotes || []) {
    const key = f.number || String(f.index + 1);
    out[String(key)] = { index: f.index, number: f.number, text: f.text, subsections: (f.subsections || []).map(s => s.text) };
  }
  return out;
}
function postFromDoc(id, doc) {
  const f = doc.fields || {};
  const y = fixedYear(f);
  const sortableDate = fixedDate(f);
  const paragraphs = (f.parsedMainText || []).filter(p => p.kind !== 'separator');
  const rawSections = paragraphs.map(p => ({ p, sections: sectionFromParagraph(p) })).filter(x => x.sections.length);
  const sections = rawSections.map(x => x.sections);
  const sectionMeta = rawSections.map((x, i) => ({ index: i, sourceIndex: x.p.index, rawIndex: x.p.rawIndex, kind: x.p.kind, chapter: x.p.chapter || '', originalText: x.p.text || '' }));
  const footnotes = (f.parsedFootnotes || []).filter(p => p.kind !== 'separator').map(p => ({ index: p.index, number: p.number, text: p.text, subsections: (p.subsections || []).map(s => s.text) }));
  const postId = postIdOf(id, f);
  const yearSeries = yearSeriesId(y);
  return { yearSeries, postId, post: { id: postId, title: String(f.title || '').trim() || postId, content: sections.slice(0, 3).flat().join('\n').slice(0, 15000), author: AUTHOR, parentSeriesId: yearSeries, createdAt: Number(f.createdAt) || now(), dayuh: { sourceCorpus: 'Sichos Kodesh', sourceDocumentId: id, sourcePath: doc.path || '', sourceBook: f.sourceBook || 'Sichos Kodesh', sourceVolume: f.sourceVolume || '', edition: f.edition || '', hebrewYear: y, originalHebrewYear: f.hebrewYear, hebrewMonth: f.hebrewMonth, hebrewDay: f.hebrewDay, sortableDate, originalSortableDate: f.sortableDate, sections, sectionMeta, footnotes, footnotesByNumber: f.parsedFootnotesByNumber || footnoteMap(f.parsedFootnotes), parser: { source: 'Sichos Kodesh.parsed.json' } } }, stats: { sections: sections.length, subsections: sections.reduce((a, b) => a + b.length, 0), footnotes: footnotes.length } };
}
function loadPosts() {
  const data = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  return Object.entries(data.collections?.Farbrengens?.documents || {}).map(([id, doc]) => postFromDoc(id, doc)).sort((a, b) => Number(a.post.dayuh.sortableDate || 0) - Number(b.post.dayuh.sortableDate || 0));
}
async function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const db = new DosDB(DB_ROOT); await db.init?.();
  const imports = SAMPLE_ONLY ? loadPosts().slice(0, 3) : loadPosts();
  const report = { BH: 'B"H', apply: APPLY, sampleOnly: SAMPLE_ONLY, source: SOURCE, parentSeries: PARENT, posts: imports.length, series: {}, totals: { sections: 0, subsections: 0, footnotes: 0 }, samples: [], errors: [] };
  await ensureSeries(db, { id: PARENT, name: 'Sichos Kodesh / שיחות קודש', description: 'Sichos Kodesh farbrengens imported from parsed source JSON.', parentSeriesId: ROOT_PARENT });
  const byYear = new Map();
  for (const item of imports) { if (!byYear.has(item.yearSeries)) byYear.set(item.yearSeries, []); byYear.get(item.yearSeries).push(item); }
  for (const [yearId, items] of byYear) {
    const year = items[0].post.dayuh.hebrewYear;
    await ensureSeries(db, { id: yearId, name: `Sichos Kodesh ${year} / שיחות קודש ${year}`, description: `Sichos Kodesh farbrengens for ${year}.`, parentSeriesId: PARENT });
    const existingPosts = await get(db, postsPath(yearId), {});
    const postsObj = existingPosts && typeof existingPosts === 'object' && !Array.isArray(existingPosts) && !Buffer.isBuffer(existingPosts) ? { ...existingPosts } : {};
    for (const item of items) {
      postsObj[item.postId] = item.post;
      report.totals.sections += item.stats.sections; report.totals.subsections += item.stats.subsections; report.totals.footnotes += item.stats.footnotes;
      if (report.samples.length < 5) report.samples.push({ yearId, postId: item.postId, title: item.post.title, stats: item.stats, year: item.post.dayuh.hebrewYear, originalYear: item.post.dayuh.originalHebrewYear, firstSection: item.post.dayuh.sections[0], footnoteKeys: Object.keys(item.post.dayuh.footnotesByNumber || {}).slice(0, 6) });
    }
    await write(db, postsPath(yearId), postsObj);
    report.series[yearId] = { year, posts: items.length };
  }
  const out = `${REPORT_DIR}/${APPLY ? 'run' : 'dry-run'}-${Date.now()}.json`; fs.writeFileSync(out, JSON.stringify(report, null, 2)); console.log(JSON.stringify({ ...report, reportPath: out }, null, 2));
}
main().catch(e => { console.error(e.stack || e); process.exit(1); });
