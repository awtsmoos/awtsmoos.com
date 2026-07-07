// B"H
/**
 * @file comment_rag_worker.mjs
 * @description
 * A separate process that embeds assigned chunks and immediately checkpoints
 * each record to JSONL. It reads global checkpoints once at startup so runs can
 * safely change worker count without recomputing old sparks, then it proceeds
 * without rereading every JSONL file after every embedding.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { embedTextAuto, runnerState } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

function arg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = process.argv.find(item => item.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const manifestFile = arg('manifest');
const resultsDir = arg('results');
const workerId = Number(arg('worker', '0'));
const workers = Number(arg('workers', '1'));
const modelRoot = arg('modelRoot');
const progressFile = path.join(resultsDir, `worker-${workerId}.progress.json`);
const resultFile = path.join(resultsDir, `worker-${workerId}.jsonl`);
const timingFile = path.join(resultsDir, `worker-${workerId}.timing.jsonl`);

function idsFromFile(file) {
  if (!fs.existsSync(file)) return [];
  const ids = [];
  for (const line of fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean)) {
    try {
      const parsed = JSON.parse(line);
      if (parsed?.id) ids.push(parsed.id);
    } catch (_) {}
  }
  return ids;
}

function readGlobalDoneIds() {
  if (!fs.existsSync(resultsDir)) return new Set();
  const ids = [];
  for (const name of fs.readdirSync(resultsDir)) {
    if (name.endsWith('.jsonl') && !name.endsWith('.timing.jsonl')) ids.push(...idsFromFile(path.join(resultsDir, name)));
  }
  return new Set(ids);
}

function writeProgress(payload) {
  fs.writeFileSync(progressFile, JSON.stringify({
    BH: 'B"H',
    workerId,
    pid: process.pid,
    ...payload,
    at: new Date().toISOString()
  }, null, 2));
}

function writeTiming(payload) {
  fs.appendFileSync(timingFile, `${JSON.stringify({ workerId, pid: process.pid, ...payload, at: new Date().toISOString() })}\n`);
}

async function main() {
  if (!manifestFile || !resultsDir || !modelRoot) throw new Error('missing required worker args');
  fs.mkdirSync(resultsDir, { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const assigned = manifest.chunks.filter((_, index) => index % workers === workerId);
  const done = readGlobalDoneIds();
  let completedNow = 0;
  let skippedGlobal = 0;
  writeProgress({ phase: 'starting', assigned: assigned.length, globalAlreadyDone: done.size, model: runnerState({ modelRoot }) });
  for (const chunk of assigned) {
    if (done.has(chunk.id)) {
      skippedGlobal++;
      continue;
    }
    const start = Date.now();
    writeProgress({ phase: 'embedding', assigned: assigned.length, globalAlreadyDone: done.size, skippedGlobal, completedNow, currentId: chunk.id, currentTextLen: chunk.text.length });
    const embedded = await embedTextAuto(chunk.text, { modelRoot });
    const afterEmbed = Date.now();
    const record = { ...chunk, vec: embedded.vector, embeddingProvider: embedded.provider, realEmbedding: embedded.realEmbedding };
    fs.appendFileSync(resultFile, `${JSON.stringify(record)}\n`);
    const afterWrite = Date.now();
    done.add(chunk.id);
    completedNow++;
    writeTiming({ id: chunk.id, textLen: chunk.text.length, embedMs: afterEmbed - start, writeMs: afterWrite - afterEmbed, completedNow, skippedGlobal });
    writeProgress({ phase: 'embedding', assigned: assigned.length, globalDoneLocal: done.size, skippedGlobal, completedNow, lastId: chunk.id, lastEmbedMs: afterEmbed - start, lastWriteMs: afterWrite - afterEmbed });
  }
  writeProgress({ phase: 'done', assigned: assigned.length, globalDoneLocal: done.size, skippedGlobal, completedNow, model: runnerState({ modelRoot }) });
}

main().catch(error => {
  writeProgress({ phase: 'error', error: String(error?.stack || error) });
  console.error(error?.stack || error);
  process.exit(1);
});
