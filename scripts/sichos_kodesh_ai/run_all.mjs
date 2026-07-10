// B"H
/** Resumable all-corpus Sichos Kodesh translation runner. */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson } from './save_output.mjs';
import { extractDocument, loadCorpus } from './corpus_utils.mjs';
import { runDocument } from './document_runner.mjs';

const args = process.argv.slice(2);
const FLAGS = new Set(args.filter(arg => arg.startsWith('--') && !arg.includes('=')).map(arg => arg.slice(2)));
const OPTIONS = Object.fromEntries(args.filter(arg => arg.startsWith('--') && arg.includes('=')).map(arg => arg.slice(2).split('=')));
const DRY_RUN = FLAGS.has('dry-run');
const FORCE = FLAGS.has('force');
const LIMIT = Number(OPTIONS.limit || 0);
const MAX_CHARS = Number(OPTIONS['max-chars'] || 12000);
const RETRIES = Number(OPTIONS.retries || 3);
const MODEL = OPTIONS.model || 'deepseek-chat';
const ONLY_ID = OPTIONS.id || '';

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function loadManifest() {
  const file = path.join(DEFAULT_OUTPUT_ROOT, 'config', 'corpus-manifest.json');
  if (!fs.existsSync(file)) throw new Error('Manifest missing: run corpus_audit.mjs first');
  return readJson(file, { documents: [] });
}

function initialState(entries) {
  return {
    startedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    model: MODEL,
    maxChars: MAX_CHARS,
    retries: RETRIES,
    total: entries.length,
    completed: [],
    failed: []
  };
}

function mergeState(existing, entries) {
  if (!existing || DRY_RUN) return initialState(entries);
  return {
    ...existing,
    resumedAt: new Date().toISOString(),
    total: entries.length,
    model: MODEL,
    maxChars: MAX_CHARS,
    retries: RETRIES,
    completed: Array.isArray(existing.completed) ? existing.completed : [],
    failed: Array.isArray(existing.failed) ? existing.failed : []
  };
}

async function main() {
  const manifest = loadManifest();
  const corpus = loadCorpus();
  let entries = manifest.documents.filter(item => item.eligible);
  if (ONLY_ID) entries = entries.filter(item => item.documentId === ONLY_ID);
  if (LIMIT > 0) entries = entries.slice(0, LIMIT);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runDir = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', DRY_RUN ? `dry-${stamp}` : 'current');
  fs.mkdirSync(runDir, { recursive: true });
  const stateFile = path.join(runDir, 'run-state.json');
  const state = mergeState(readJson(stateFile, null), entries);
  writeJson(stateFile, state);
  const completedIds = new Set(state.completed.map(item => item.documentId));
  for (const entry of entries) {
    if (!FORCE && completedIds.has(entry.documentId)) continue;
    try {
      const sourceDoc = corpus.collections.Farbrengens.documents[entry.documentId];
      const document = extractDocument(entry.documentId, sourceDoc);
      const summary = await runDocument(document, {
        rootDir: runDir,
        model: MODEL,
        maxChars: MAX_CHARS,
        retries: RETRIES,
        dryRun: DRY_RUN,
        force: FORCE
      });
      state.completed = state.completed.filter(item => item.documentId !== entry.documentId);
      state.completed.push({ documentId: entry.documentId, chunks: summary.chunks, completedAt: new Date().toISOString() });
      state.failed = state.failed.filter(item => item.documentId !== entry.documentId);
      completedIds.add(entry.documentId);
    } catch (error) {
      state.failed = state.failed.filter(item => item.documentId !== entry.documentId);
      state.failed.push({ documentId: entry.documentId, error: error.stack || String(error), failedAt: new Date().toISOString() });
      writeJson(stateFile, state);
      if (!FLAGS.has('continue-on-error')) throw error;
    }
    writeJson(stateFile, state);
  }
  state.finishedAt = new Date().toISOString();
  writeJson(stateFile, state);
  console.log(JSON.stringify({ runDir, total: state.total, completed: state.completed.length, failed: state.failed.length, dryRun: DRY_RUN }, null, 2));
}

main().catch(error => {
  console.error(error.stack || String(error));
  process.exit(1);
});
