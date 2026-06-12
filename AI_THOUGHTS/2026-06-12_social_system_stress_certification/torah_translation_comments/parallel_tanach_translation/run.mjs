//B"H
/**
 * @module runParallelTanachTranslation
 * @description Runs chunked aligned Bereishis/Tehillim translation comments.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { DB_ROOT, PROMPT_VERSION, ROOT } from './config.mjs';
import { alignJob, loadTanach } from './tanach_alignment.mjs';
import { chapterSlug, log, prepareRun, readState, saveJson, writeState } from './state.mjs';
import { clientConfig, translateChapter } from './minimax_client.mjs';
import { discoverSocialChapters, parseArgs } from './social_corpus.mjs';
import { jobsFromAlignedFile } from './cached_jobs.mjs';
import { ensureTranslationAlias, existingHashes, verifyWrite, writeComment } from './comments.mjs';
import { mapLimit, summarize } from './runner_utils.mjs';
import { sourceHash } from './hash.mjs';

const require = createRequire(import.meta.url);
const DosDB = require(path.join(ROOT, 'ayzarim/DosDB/index.js'));

function chunks(units, size) {
  const out = [];
  for (let i = 0; i < units.length; i += size) out.push({ index: out.length + 1, units: units.slice(i, i + size) });
  return out;
}

async function writeTranslations({ db, job, translations, batchId, chapter }) {
  const bySection = new Map(job.units.map(unit => [unit.verseSection, unit]));
  for (const item of translations) {
    const unit = bySection.get(item.verseSection);
    const id = await writeComment({ db, job, unit, english: item.english, batchId });
    const verified = await verifyWrite(db, job, unit);
    if (!verified) throw new Error(`Readback failed ${job.series} ${job.chapter} ${unit.verseSection}`);
    chapter.written += 1;
    chapter.results.push({ verseSection: unit.verseSection, id, verified, sourceHash: sourceHash(unit) });
    log('B"H translation comment verified', { series: job.series, chapter: job.chapter, verseSection: unit.verseSection, id });
  }
}

async function runChunk({ db, config, job, chunk, options, batchId, runDir, chapter }) {
  const chunkJob = { ...job, units: chunk.units };
  log('B"H translating chunk', { series: job.series, chapter: job.chapter, chunk: chunk.index, verses: chunk.units.length });
  const translated = await translateChapter(config, chunkJob);
  const base = path.join(runDir, 'minimax', `${chapterSlug(job)}_chunk_${String(chunk.index).padStart(2, '0')}`);
  saveJson(`${base}.input.json`, { promptVersion: PROMPT_VERSION, job: chunkJob });
  saveJson(`${base}.output.json`, { raw: { ...translated.raw, raw: undefined }, parsed: translated.parsed, translations: translated.translations });
  if (!options.write) {
    chapter.dryRun += translated.translations.length;
    chapter.results.push(...translated.translations.map(t => ({ ...t, status: 'dry_run', chunk: chunk.index })));
    return;
  }
  await writeTranslations({ db, job: chunkJob, translations: translated.translations, batchId, chapter });
}

async function runChapter({ db, config, job, options, batchId, runDir }) {
  const existing = await existingHashes(db, job);
  const pending = job.units.filter(unit => options.force || (!existing.has(`${String(unit.verseIndex - 1)}:${sourceHash(unit)}`) && !existing.has(`${String(unit.verseIndex - 1)}:ANY`)));
  const chapter = { series: job.series, chapter: job.chapter, postId: job.postId, tanachArticleIndex: job.tanachArticleIndex, totalVerses: job.units.length, pending: pending.length, skipped: job.units.length - pending.length, written: 0, dryRun: 0, results: [], errors: [] };
  if (!pending.length) return chapter;
  for (const chunk of chunks(pending, options.chunkVerses)) await runChunk({ db, config, job, chunk, options, batchId, runDir, chapter });
  return chapter;
}

async function buildJobs(db, options, tanach) {
  if (options.alignedJobs) return jobsFromAlignedFile(tanach, options.alignedJobs);
  return (await discoverSocialChapters(db, options)).map(job => alignJob(tanach, job));
}

async function main() {
  const options = parseArgs();
  const batchId = `BH_TANACH_TRANSLATION_${Date.now()}`;
  const runDir = prepareRun(batchId);
  const db = new DosDB(DB_ROOT);
  await db.init();
  await ensureTranslationAlias(db);
  const tanach = loadTanach();
  const jobs = await buildJobs(db, options, tanach);
  saveJson(path.join(runDir, 'aligned_jobs.json'), jobs.map(j => ({ series: j.series, chapter: j.chapter, postId: j.postId, tanachArticleIndex: j.tanachArticleIndex, verses: j.units.length })));
  log('B"H aligned jobs', jobs.map(j => ({ series: j.series, chapter: j.chapter, tanachArticleIndex: j.tanachArticleIndex, verses: j.units.length })));
  const state = readState();
  const run = { batchId, startedAt: Date.now(), options, runDir, chapters: [] };
  state.runs.push(run);
  writeState(state);
  const config = clientConfig();
  run.chapters = await mapLimit(jobs, options.parallel, job => runChapter({ db, config, job, options, batchId, runDir }));
  run.finishedAt = Date.now();
  run.summary = summarize(run.chapters);
  saveJson(path.join(runDir, 'run_summary.json'), run);
  writeState(state);
  log('B"H Tanach translation run complete', run.summary);
}

main().catch(error => {
  log('B"H Tanach translation run failed', { message: error.message, stack: error.stack });
  process.exit(1);
});
