// B"H
/** Cross-chunk salvage for pending invalid chunks; remove only sup tags. */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson, writeText } from './save_output.mjs';
import { chunkDocument, extractDocument, loadCorpus } from './corpus_utils.mjs';
import { parseSichosXml } from './parse_xml.mjs';
import { recoverExactChunk } from './response_repair.mjs';
import { validateForJob } from './translation_policy.mjs';

const ROOT = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const OUT = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'salvage');
const MAX_CHARS = 3500;

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function readResponses(documentDir) {
  const found = [];
  const chunksDir = path.join(documentDir, 'chunks');
  if (!fs.existsSync(chunksDir)) return found;
  for (const entry of fs.readdirSync(chunksDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(chunksDir, entry.name);
    const response = path.join(dir, 'response.xml');
    if (fs.existsSync(response)) found.push({ source: response, text: fs.readFileSync(response, 'utf8') });
    const raw = readJson(path.join(dir, 'raw-response.json'));
    const rawText = raw?.choices?.[0]?.message?.content;
    if (typeof rawText === 'string') found.push({ source: path.join(dir, 'raw-response.json'), text: rawText });
    const attempts = path.join(dir, 'attempts');
    if (fs.existsSync(attempts)) for (const name of fs.readdirSync(attempts)) {
      const file = path.join(attempts, name, 'response.xml');
      if (fs.existsSync(file)) found.push({ source: file, text: fs.readFileSync(file, 'utf8') });
    }
  }
  return found;
}

function targetDir(documentId, index) {
  return path.join(ROOT, 'documents', documentId, 'chunks', String(index).padStart(4, '0'));
}

function alreadyValid(chunk, dir) {
  const file = path.join(dir, 'response.xml');
  if (!fs.existsSync(file)) return false;
  try { return validateForJob(chunk, parseSichosXml(fs.readFileSync(file, 'utf8'))).ok; } catch { return false; }
}

function save(chunk, dir, recovered, source) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'response.xml');
  if (fs.existsSync(file)) {
    const backup = path.join(dir, 'response.pre-footnote-free-salvage.xml');
    if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
  }
  writeText(file, recovered.xml);
  writeJson(path.join(dir, 'parsed.json'), recovered.parsed);
  writeJson(path.join(dir, 'validation.json'), recovered.validation);
  const old = readJson(path.join(dir, 'result.json'), {});
  writeJson(path.join(dir, 'result.json'), { ...old, chunkIndex: chunk.chunkIndex,
    validation: recovered.validation, mechanicallySalvaged: true, footnotesSkipped: true,
    recoveryMethod: recovered.method, salvageSource: source, salvagedAt: new Date().toISOString() });
}

function main() {
  const state = readJson(path.join(ROOT, 'swarm-state.json'), { completed: [] });
  const completed = new Set((state.completed || []).map(item => item.documentId));
  const corpus = loadCorpus();
  const applied = [];
  let chunksAudited = 0;
  for (const [documentId, sourceDoc] of Object.entries(corpus.collections?.Farbrengens?.documents || {})) {
    if (completed.has(documentId)) continue;
    const document = extractDocument(documentId, sourceDoc);
    if (!document.meaningfulSubsectionCount) continue;
    const chunks = chunkDocument(document, MAX_CHARS);
    const responses = readResponses(path.join(ROOT, 'documents', documentId));
    if (!responses.length) continue;
    for (const chunk of chunks) {
      const dir = targetDir(documentId, chunk.chunkIndex);
      if (alreadyValid(chunk, dir)) continue;
      chunksAudited++;
      for (const response of responses) {
        const recovered = recoverExactChunk(chunk, response.text);
        if (!recovered.ok) continue;
        save(chunk, dir, recovered, response.source);
        applied.push({ documentId, chunkIndex: chunk.chunkIndex, source: response.source,
          method: recovered.method, combinedChars: chunk.combinedChars });
        break;
      }
    }
  }
  fs.mkdirSync(OUT, { recursive: true });
  const report = { generatedAt: new Date().toISOString(), footnotesSkipped: true,
    chunksAudited, newlySavedChunks: applied.length,
    savedSourceChars: applied.reduce((sum, item) => sum + item.combinedChars, 0), applied };
  writeJson(path.join(OUT, 'footnote-free-salvage.json'), report);
  console.log(JSON.stringify(report, null, 2));
}

main();
