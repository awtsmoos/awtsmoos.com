// B"H
/**
 * Meluket translation swarm runner.
 *
 * - Builds stable chunk jobs across canonical Meluket month series.
 * - Assigns each job by globalIndex % workerCount.
 * - Runs workers concurrently with no overlapping ownership.
 * - Skips already completed validated chunks.
 * - Saves raw XML, raw JSON, validation, source chunk, and progress.
 * - Writes NOTHING to DosDB/comments.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { buildWholePostPrompt } = require('./meluketWholePostPrompt.js');

const apiKey = process.env.DEEPSEEK_API_KEY;
const postsDbFile = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/socialPacked/social.heichel.ikar.posts.fs.awtsdb';
const outDir = path.join(__dirname, 'generated', 'meluket-swarm');
const model = process.argv.find(a => a.startsWith('--model='))?.split('=')[1] || 'deepseek-chat';
const workerCount = Number(process.argv.find(a => a.startsWith('--workers='))?.split('=')[1] || 50);
const sectionsPerRequest = Number(process.argv.find(a => a.startsWith('--sectionsPerRequest='))?.split('=')[1] || 3);
const limitJobs = Number(process.argv.find(a => a.startsWith('--limitJobs='))?.split('=')[1] || 0);
const dryRun = !process.argv.includes('--run');
const months = ['תשרי_meluket','חשון_meluket','כסלו_meluket','טבת_meluket','שבט_meluket','אדר_meluket','ניסן_meluket','אייר_meluket','סיון_meluket','תמוז_meluket','מנחם אב_meluket','אלול_meluket'];

function safeName(value) { return encodeURIComponent(String(value)).replace(/%/g, '_'); }
function stripHtml(text) { return String(text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function openDb() { const db = new AwtsmoosDB(postsDbFile, { compression: false, reuseFreedSpace: 'verified', readOnly: true, processLockMode: 'shared', lockMode: 'shared' }); db.open(); return db; }
function closeDb(db) { try { db.pager?.close?.(); db.processLock?.release?.(); } catch {} }
function readPosts(db, seriesId) { const p = `/social/heichelos/ikar/series/${seriesId}/posts.awtsmoosJSON`; const st = db.fs.stat(p); return awts.deserializeBinary(db.fs.readRange(p, 0, st.size)); }
function keys(o) { return o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o).filter(k => !k.startsWith('__')) : []; }
function sectionParts(section) { if (Array.isArray(section)) return section.map(stripHtml).filter(Boolean); const single = stripHtml(section); return single ? [single] : []; }
function expectedKeys(batch) { const out = new Set(); for (const section of batch.sections) for (const item of section.items) out.add(`${section.v}:${item.s}`); return out; }
function attr(text, name) { const m = text.match(new RegExp(`${name}="([^"]*)"`)); return m ? m[1] : ''; }
function unescapeXml(text) { return String(text).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
function textTag(xml, name) { return unescapeXml((xml.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`)) || [])[1] || '').trim(); }
function stripMarkdownFences(xml) { return xml.replace(/^\s*```(?:xml)?\s*/i, '').replace(/\s*```\s*$/i, '').trim(); }
function chunkPath(job, name) { return path.join(outDir, 'chunks', job.jobId, name); }
function donePath(job) { return chunkPath(job, 'DONE.json'); }
function failPath(job) { return chunkPath(job, 'FAILED.json'); }
function atomicWrite(file, content) { fs.mkdirSync(path.dirname(file), { recursive: true }); const tmp = `${file}.${process.pid}.${Date.now()}.tmp`; fs.writeFileSync(tmp, content); fs.renameSync(tmp, file); }
function parseFragment(rawXml) {
  const hadFence = /^\s*```/i.test(rawXml);
  const xml = stripMarkdownFences(rawXml);
  const rootOpen = xml.match(/<awtsmoosMeluketTranslation\b[^>]*>/)?.[0] || '';
  const sections = [];
  for (const sectionBlock of [...xml.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map(m => m[0])) {
    const sectionOpen = sectionBlock.match(/<section\b[^>]*>/)?.[0] || '';
    const v = Number(attr(sectionOpen, 'v'));
    const sectionSummaryBrief = textTag(sectionBlock, 'sectionSummaryBrief');
    const translations = [...sectionBlock.matchAll(/<t\b[^>]*>[\s\S]*?<\/t>/g)].map(m => m[0]).map(tBlock => {
      const open = tBlock.match(/<t\b[^>]*>/)?.[0] || '';
      return { v, s: Number(attr(open, 's')), translation: unescapeXml((tBlock.match(/<t\b[^>]*>([\s\S]*?)<\/t>/) || [])[1] || '').trim() };
    });
    sections.push({ v, sectionSummaryBrief, translations });
  }
  return { hadFence, xml, root: { heichel: attr(rootOpen, 'heichel'), alias: attr(rootOpen, 'alias'), seriesId: attr(rootOpen, 'seriesId'), postId: attr(rootOpen, 'postId'), batchId: attr(rootOpen, 'batchId') }, sections };
}
function validateFragment(batch, parsed) {
  const expected = expectedKeys(batch);
  const actual = new Set(parsed.sections.flatMap(sec => sec.translations.map(t => `${t.v}:${t.s}`)));
  const missing = [...expected].filter(k => !actual.has(k));
  const extra = [...actual].filter(k => !expected.has(k));
  const empty = parsed.sections.flatMap(sec => sec.translations).filter(t => !t.translation).map(t => `${t.v}:${t.s}`);
  const expectedSummaryVs = new Set(batch.sections.map(s => String(s.v)));
  const summaryVs = new Set(parsed.sections.filter(s => s.sectionSummaryBrief).map(s => String(s.v)));
  const missingSummaries = [...expectedSummaryVs].filter(v => !summaryVs.has(v));
  const rootOk = parsed.root.seriesId === batch.seriesId && parsed.root.postId === batch.postId && parsed.root.batchId === batch.batchId && parsed.root.alias === 'meluket_translation_en';
  return { ok: rootOk && !missing.length && !extra.length && !empty.length && !missingSummaries.length, rootOk, expected: expected.size, returned: actual.size, missing, extra, empty, missingSummaries, markdownFencePresent: parsed.hadFence };
}
function buildJobs() {
  const db = openDb(); const jobs = [];
  try {
    for (const seriesId of months) {
      const posts = readPosts(db, seriesId);
      for (const postId of keys(posts)) {
        const post = posts[postId];
        const sections = [];
        for (let v = 0; v < (post.dayuh?.sections || []).length; v++) {
          const items = sectionParts(post.dayuh.sections[v]).map((text, s) => ({ s, text }));
          if (items.length) sections.push({ v, items });
        }
        for (let start = 0, part = 1; start < sections.length; start += sectionsPerRequest, part++) {
          const chunkSections = sections.slice(start, start + sectionsPerRequest);
          const baseId = `${safeName(seriesId)}__${safeName(postId)}__p${String(part).padStart(3, '0')}`;
          jobs.push({ globalIndex: jobs.length, owner: jobs.length % workerCount, jobId: baseId, batchId: `meluket-${baseId}`, seriesId, postId, title: post.title, part, sections: chunkSections });
        }
      }
    }
  } finally { closeDb(db); }
  return limitJobs ? jobs.slice(0, limitJobs) : jobs;
}
async function callDeepSeek(prompt) {
  const res = await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, temperature: 0.1, messages: [{ role: 'user', content: prompt }] }) });
  const text = await res.text(); let json; try { json = JSON.parse(text); } catch {}
  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}: ${text.slice(0, 1200)}`);
  return { status: res.status, rawJson: json, content: json?.choices?.[0]?.message?.content || '' };
}
function writeProgress(progress) { atomicWrite(path.join(outDir, 'progress.json'), JSON.stringify({ B_H: true, updatedAt: new Date().toISOString(), ...progress }, null, 2)); }
async function processJob(job) {
  if (fs.existsSync(donePath(job))) return { skipped: true, jobId: job.jobId };
  fs.rmSync(path.dirname(failPath(job)), { recursive: true, force: true });
  fs.mkdirSync(path.dirname(donePath(job)), { recursive: true });
  atomicWrite(chunkPath(job, 'source.json'), JSON.stringify(job, null, 2));
  const prompt = buildWholePostPrompt(job);
  atomicWrite(chunkPath(job, 'prompt.xml.txt'), prompt);
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await callDeepSeek(prompt);
      atomicWrite(chunkPath(job, `response-attempt-${attempt}.raw.json`), JSON.stringify(response.rawJson, null, 2));
      atomicWrite(chunkPath(job, `response-attempt-${attempt}.xml`), response.content.trim());
      const parsed = parseFragment(response.content);
      const validation = validateFragment(job, parsed);
      atomicWrite(chunkPath(job, `validation-attempt-${attempt}.json`), JSON.stringify({ validation, parsed }, null, 2));
      if (!validation.ok) throw new Error(`validation failed ${JSON.stringify(validation).slice(0, 2000)}`);
      atomicWrite(donePath(job), JSON.stringify({ B_H: true, completedAt: new Date().toISOString(), attempt, validation }, null, 2));
      return { ok: true, jobId: job.jobId, expected: validation.expected, returned: validation.returned };
    } catch (err) {
      lastError = err;
      await new Promise(r => setTimeout(r, 2000 * attempt + Math.floor(Math.random() * 1500)));
    }
  }
  atomicWrite(failPath(job), JSON.stringify({ B_H: true, failedAt: new Date().toISOString(), error: lastError?.stack || String(lastError) }, null, 2));
  return { ok: false, jobId: job.jobId, error: lastError?.message || String(lastError) };
}
async function worker(owner, ownedJobs, counters) {
  for (const job of ownedJobs) {
    const result = await processJob(job);
    counters.processed++;
    if (result.skipped) counters.skipped++;
    else if (result.ok) counters.completed++;
    else counters.failed++;
    if (counters.processed % 10 === 0 || result.ok === false) writeProgress(counters);
  }
}
async function main() {
  if (!apiKey && !dryRun) throw new Error('DEEPSEEK_API_KEY is not set');
  fs.mkdirSync(outDir, { recursive: true });
  const jobs = buildJobs();
  const plan = { B_H: true, dryRun, outDir, model, workerCount, sectionsPerRequest, totalJobs: jobs.length, totalExpectedTranslations: jobs.reduce((n, j) => n + expectedKeys(j).size, 0), postsDbFile, owners: Object.fromEntries([...Array(workerCount).keys()].map(i => [i, jobs.filter(j => j.owner === i).length])) };
  atomicWrite(path.join(outDir, 'plan.json'), JSON.stringify(plan, null, 2));
  console.log(JSON.stringify(plan, null, 2));
  if (dryRun) return;
  const counters = { totalJobs: jobs.length, processed: 0, completed: 0, skipped: 0, failed: 0 };
  writeProgress(counters);
  await Promise.all([...Array(workerCount).keys()].map(owner => worker(owner, jobs.filter(j => j.owner === owner), counters)));
  writeProgress(counters);
  if (counters.failed) process.exitCode = 4;
}
main().catch(err => { console.error(err.stack || err.message); process.exit(1); });
