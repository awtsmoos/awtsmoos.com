//B"H
/**
 * @module ParallelMinimaxTorahTranslationComments
 * @description
 * Translate Torah chapter posts with Minimax and write English verse comments.
 *
 * Chapter 110: Bereishis and Tehillim open together like two gates of dawn.
 * The Hebrew stone is never carved again; each English line becomes a lamped
 * comment placed beside its verse, under one translation alias, resumable by
 * the actual comment tree rather than by wishful memory.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require('../../../ayzarim/DosDB/index.js');
const { createApiKey, verifyApiKey } = require('../../../geelooy/API/social/helper/apiKeys.js');
const { loadConfig } = require('../../../geelooy/apps/tunnel/agent/lib/config.js');
const { sendAgentMessage } = require('../../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/client.js');

const ROOT = process.cwd();
const DB_ROOT = path.resolve(ROOT, '../../dayuhChadash');
const OUT_DIR = path.resolve(ROOT, 'AI_THOUGHTS/2026-06-12_social_system_stress_certification/torah_translation_comments');
const STATE_PATH = path.join(OUT_DIR, 'parallel_translation_state.json');
const LOG_PATH = path.join(OUT_DIR, 'parallel_translation_latest.log');
const HEICHEL_ID = 'ikar';
const TRANSLATION_ALIAS = 'torah_translation_en';
const TRANSLATION_USER = 'BH_TORAH_TRANSLATION_EN_USER';
const PROMPT_VERSION = 'torah-comment-translation-v1';
const DIVINE_NAME_POLICY = {
  'יהוה': 'Awtsmoos',
  'יְהֹוָה': 'Awtsmoos',
  'אלהים': 'Elokim',
  'אֱלֹהִים': 'Elokim',
  'אל': 'El',
  'אֵל': 'El',
  'אל שדי': 'El-Shaddai',
  'שדי': 'Shaddai',
  'צבאות': 'Tzevaos',
  'אדני': 'Adonai',
  'אֲדֹנָי': 'Adonai'
};

function parseArgs() {
  const args = new Map();
  for (const raw of process.argv.slice(2)) {
    const [key, ...rest] = raw.replace(/^--/, '').split('=');
    args.set(key, rest.length ? rest.join('=') : 'true');
  }
  return {
    write: args.get('write') === 'true',
    force: args.get('force') === 'true',
    books: (args.get('books') || 'bereishis,tehillim').split(',').map(s => s.trim()).filter(Boolean),
    chapters: Number(args.get('chapters') || 5),
    parallel: Math.max(1, Number(args.get('parallel') || 2)),
    maxVersesPerChapter: Number(args.get('max-verses-per-chapter') || 0),
    minimaxOnly: args.get('minimax-only') === 'true'
  };
}

function log(line, data) {
  const rendered = data === undefined ? line : `${line} ${JSON.stringify(data)}`;
  console.log(rendered);
  fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} ${rendered}\n`);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stableString(value) {
  return JSON.stringify(value, Object.keys(value).sort());
}

function sourceHash({ book, chapter, verseSection, hebrew }) {
  return sha256(JSON.stringify({ book, chapter, verseSection, hebrew, policy: DIVINE_NAME_POLICY, promptVersion: PROMPT_VERSION }));
}

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); } catch { return { runs: [] }; }
}

function writeState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function sortChapterPosts(posts) {
  return Object.values(posts || {}).sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
}

function verseSection(index) {
  return `verse-${index + 1}`;
}

function extractChapterJob(series, post, maxVerses) {
  const chapter = Number(String(post.title || '').match(/\d+/)?.[0] || 0);
  const sections = Array.isArray(post.dayuh?.sections) ? post.dayuh.sections : [];
  const chosen = maxVerses > 0 ? sections.slice(0, maxVerses) : sections;
  const verses = chosen.map((hebrew, index) => ({
    book: series,
    chapter,
    heichelId: HEICHEL_ID,
    seriesId: series,
    postId: post.id || post.postId,
    verseIndex: index + 1,
    verseSection: verseSection(index),
    hebrew: String(hebrew || '')
  })).filter(v => v.hebrew.trim());
  return { series, book: series, chapter, postId: post.id || post.postId, title: post.title, verses };
}

async function discoverJobs(db, options) {
  const jobs = [];
  for (const series of options.books) {
    const posts = await db.read(`/social/heichelos/${HEICHEL_ID}/series/${series}/posts`);
    const ordered = sortChapterPosts(posts).slice(0, options.chapters);
    for (const post of ordered) jobs.push(extractChapterJob(series, post, options.maxVersesPerChapter));
  }
  return jobs.filter(job => job.verses.length);
}

async function existingTranslationHashes(db, job) {
  const found = new Map();
  const existing = await db.read(`/social/heichelos/${HEICHEL_ID}/comments/atSeries/${job.series}/atPost/${job.postId}/${TRANSLATION_ALIAS}`);
  if (!existing || typeof existing !== 'object') return found;
  for (const [section, comments] of Object.entries(existing)) {
    for (const comment of Array.isArray(comments) ? comments : []) {
      const dayuh = typeof comment.dayuh === 'string' ? safeJson(comment.dayuh) : comment.dayuh;
      if (dayuh?.translation && dayuh.language === 'en' && dayuh.source === 'minimax' && dayuh.sourceHash) {
        found.set(`${section}:${dayuh.sourceHash}`, comment.id || true);
      }
    }
  }
  return found;
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function cleanJsonText(text) {
  const trimmed = String(text || '').trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1].trim() : trimmed;
  const first = body.indexOf('{');
  const last = body.lastIndexOf('}');
  if (first >= 0 && last >= first) return body.slice(first, last + 1);
  return body;
}

function validateTranslations(job, parsed) {
  assert.ok(parsed && Array.isArray(parsed.translations), 'Minimax JSON must contain translations array');
  const bySection = new Map(job.verses.map(v => [v.verseSection, v]));
  const out = [];
  for (const item of parsed.translations) {
    assert.ok(item && typeof item === 'object', 'translation item must be object');
    assert.ok(bySection.has(item.verseSection), `unknown verseSection ${item.verseSection}`);
    assert.ok(typeof item.english === 'string' && item.english.trim(), `missing english for ${item.verseSection}`);
    out.push({ verseSection: item.verseSection, english: item.english.trim() });
  }
  assert.equal(out.length, job.verses.length, `translation count mismatch for ${job.series} ${job.title}`);
  return out;
}

function promptFor(job) {
  return `B"H. Translate these Hebrew Tanach verses into clear English.\n\nRules:\n1. Return JSON only. No markdown.\n2. Preserve every verseSection exactly.\n3. Do not omit or add verses.\n4. Do not add commentary, footnotes, brackets, or introductions.\n5. Use this Divine Name policy exactly: ${JSON.stringify(DIVINE_NAME_POLICY)}.\n6. In particular, the Four-Letter Name must be rendered as Awtsmoos.\n7. Keep the translation faithful and readable.\n\nInput JSON:\n${JSON.stringify({ book: job.series, chapter: job.chapter, postId: job.postId, verses: job.verses.map(v => ({ verseSection: v.verseSection, hebrew: v.hebrew })) }, null, 2)}\n\nOutput schema:\n{ "translations": [ { "verseSection": "verse-1", "english": "..." } ] }`;
}

async function translateChapter(config, job) {
  log('B"H MINIMAX chapter start', { series: job.series, chapter: job.chapter, verses: job.verses.length });
  const result = await sendAgentMessage(config, {
    provider: 'minimax',
    agentId: 'minimax-deep',
    stream: false,
    message: promptFor(job)
  });
  if (!result?.ok) throw new Error(`Minimax failed: ${JSON.stringify(result)}`);
  const parsed = JSON.parse(cleanJsonText(result.text));
  const translations = validateTranslations(job, parsed);
  log('B"H MINIMAX chapter translated', { series: job.series, chapter: job.chapter, translations: translations.length, tokens: result.usage?.total_tokens });
  return { translations, usage: result.usage || null };
}

async function request(route, { method = 'GET', body, apiKey, timeoutMs = 20000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`TIMEOUT ${method} ${route}`)), timeoutMs);
  try {
    const withKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
    const finalBody = apiKey && body ? { apiKey, ...body } : body;
    const response = await fetch(`http://127.0.0.1:8080${withKey}`, {
      method,
      headers: {
        ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}),
        ...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {})
      },
      body: finalBody ? new URLSearchParams(finalBody).toString() : undefined,
      signal: controller.signal
    });
    const text = await response.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
    return { status: response.status, json, text };
  } finally {
    clearTimeout(timer);
  }
}

async function seedApiKey(db) {
  const $i = { db, request: { user: { info: { userId: TRANSLATION_USER } }, headers: {} }, $_POST: { label: 'parallel torah translation comments' } };
  const created = await createApiKey({ $i, userid: TRANSLATION_USER });
  assert.ok(created.success?.key, 'translation API key should be created');
  const direct = await verifyApiKey({ $i: { db, request: { headers: {} }, $_GET: { apiKey: created.success.key }, $_POST: {}, $_DELETE: {} } });
  assert.equal(direct.success?.userId, TRANSLATION_USER);
  return created.success.key;
}

async function startServer() {
  const out = fs.openSync(path.join(OUT_DIR, 'parallel_translation_server.out.log'), 'a');
  const err = fs.openSync(path.join(OUT_DIR, 'parallel_translation_server.err.log'), 'a');
  const server = spawn('node', ['index'], { cwd: ROOT, stdio: ['ignore', out, err], env: { ...process.env, AWTSMOOS_TORAH_TRANSLATION: '1' } });
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited before ready: ${server.exitCode}`);
    try {
      const probe = await request('/api/social/keys/verify?apiKey=probe', { timeoutMs: 2000 });
      if (probe.status === 200 || probe.status === 404) return server;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Server did not become ready');
}

async function stopServer(server) {
  if (server?.exitCode === null) server.kill('SIGTERM');
  await new Promise(resolve => setTimeout(resolve, 250));
}

async function ensureTranslationAlias(apiKey) {
  const res = await request('/api/social/aliases', {
    method: 'POST', apiKey,
    body: { aliasName: 'Torah Translation English', inputId: TRANSLATION_ALIAS, description: 'Automated English Torah translation comments via Minimax.' }
  });
  if (res.status !== 200 || res.json?.error) throw new Error(`Alias ensure failed: ${res.text}`);
}

function commentDayuh(job, verse, english, batchId) {
  return {
    verseSection: verse.verseSection,
    translation: true,
    language: 'en',
    source: 'minimax',
    sourceHash: sourceHash(verse),
    sourceBook: job.series,
    sourceChapter: job.chapter,
    sourcePostId: job.postId,
    promptVersion: PROMPT_VERSION,
    batchId,
    modelAlias: 'minimax-deep',
    divineNamePolicy: DIVINE_NAME_POLICY,
    hebrewPreview: verse.hebrew.slice(0, 160),
    englishPreview: english.slice(0, 160)
  };
}

async function writeVerseComment({ job, verse, english, apiKey, batchId }) {
  const dayuh = commentDayuh(job, verse, english, batchId);
  const route = `/api/social/heichelos/${encodeURIComponent(HEICHEL_ID)}/post/${encodeURIComponent(job.postId)}/comments/`;
  const res = await request(route, {
    method: 'POST', apiKey,
    body: { aliasId: TRANSLATION_ALIAS, seriesId: job.series, content: english, dayuh: JSON.stringify(dayuh) },
    timeoutMs: 30000
  });
  if (res.status !== 200 || res.json?.error || res.json?.success !== true) throw new Error(`Comment write failed ${job.series} ${job.chapter} ${verse.verseSection}: ${res.text}`);
  return res.json.details?.id || null;
}

async function verifyComment(db, job, verse, hash) {
  const existing = await existingTranslationHashes(db, job);
  return existing.get(`${verse.verseSection}:${hash}`) || null;
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function runMinimaxOnly(config) {
  const job = { series: 'probe', chapter: 1, postId: 'probe', title: 'Chapter 1', verses: [
    { verseSection: 'verse-1', hebrew: 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ:' },
    { verseSection: 'verse-2', hebrew: 'כִּ֚י אִ֥ם־בְּתוֹרַ֥ת יְהֹוָ֗ה חֶ֫פְצ֥וֹ' }
  ] };
  const translated = await translateChapter(config, job);
  log('B"H minimax-only result', translated.translations);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(LOG_PATH, '');
  const options = parseArgs();
  const db = new DosDB(DB_ROOT);
  await db.init();
  const config = loadConfig();
  if (options.minimaxOnly) return await runMinimaxOnly(config);
  const allJobs = await discoverJobs(db, options);
  const batchId = `BH_TORAH_TRANSLATION_${Date.now()}`;
  const state = readState();
  const run = { batchId, startedAt: Date.now(), options, dbRoot: DB_ROOT, heichelId: HEICHEL_ID, aliasId: TRANSLATION_ALIAS, chapters: [] };
  state.runs.push(run);
  writeState(state);
  log('B"H discovered chapter jobs', allJobs.map(j => ({ series: j.series, chapter: j.chapter, postId: j.postId, verses: j.verses.length })));

  let server = null;
  let apiKey = null;
  if (options.write) {
    apiKey = await seedApiKey(db);
    server = await startServer();
    await ensureTranslationAlias(apiKey);
  }

  try {
    await mapLimit(allJobs, options.parallel, async job => {
      const existing = await existingTranslationHashes(db, job);
      const pending = job.verses.filter(v => options.force || !existing.has(`${v.verseSection}:${sourceHash(v)}`));
      const chapterState = { series: job.series, chapter: job.chapter, postId: job.postId, totalVerses: job.verses.length, pending: pending.length, skipped: job.verses.length - pending.length, writes: [], errors: [] };
      run.chapters.push(chapterState);
      writeState(state);
      if (!pending.length) {
        log('B"H chapter skipped existing', { series: job.series, chapter: job.chapter, total: job.verses.length });
        return;
      }
      const pendingJob = { ...job, verses: pending };
      const { translations, usage } = await translateChapter(config, pendingJob);
      chapterState.usage = usage;
      const byVerse = new Map(pending.map(v => [v.verseSection, v]));
      for (const translation of translations) {
        const verse = byVerse.get(translation.verseSection);
        const hash = sourceHash(verse);
        if (!options.write) {
          chapterState.writes.push({ verseSection: verse.verseSection, status: 'dry_run', hash, englishPreview: translation.english.slice(0, 120) });
          continue;
        }
        const id = await writeVerseComment({ job, verse, english: translation.english, apiKey, batchId });
        const verified = await verifyComment(db, job, verse, hash);
        if (!verified) throw new Error(`Readback verification failed for ${job.series} ${job.chapter} ${verse.verseSection}`);
        chapterState.writes.push({ verseSection: verse.verseSection, status: 'written_verified', id, verified, hash });
        log('B"H wrote translation comment', { series: job.series, chapter: job.chapter, verseSection: verse.verseSection, id });
        writeState(state);
      }
      writeState(state);
    });
  } finally {
    await stopServer(server);
  }
  run.finishedAt = Date.now();
  run.summary = run.chapters.reduce((acc, chapter) => {
    acc.chapters += 1;
    acc.totalVerses += chapter.totalVerses;
    acc.pending += chapter.pending;
    acc.skipped += chapter.skipped;
    acc.writes += chapter.writes.length;
    acc.errors += chapter.errors.length;
    return acc;
  }, { chapters: 0, totalVerses: 0, pending: 0, skipped: 0, writes: 0, errors: 0 });
  writeState(state);
  log('B"H parallel Torah translation complete', run.summary);
}

main().catch(error => {
  log('B"H parallel Torah translation failed', { message: error.message, stack: error.stack });
  process.exit(1);
});
