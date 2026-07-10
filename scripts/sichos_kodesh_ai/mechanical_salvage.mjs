// B"H
/** Footnote-free salvage of already returned model text; no API calls. */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson, writeText } from './save_output.mjs';
import { chunkDocument, extractDocument, loadCorpus } from './corpus_utils.mjs';
import { parseSichosXml } from './parse_xml.mjs';
import { recoverExactChunk } from './response_repair.mjs';
import { validateForJob } from './translation_policy.mjs';
import { combineXml } from './document_runner.mjs';

const ROOT = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const STATE = path.join(ROOT, 'swarm-state.json');
const OUT = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'mechanical-salvage');
const MAX_CHARS = 3500;

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function dirFor(documentId, index) {
  return path.join(ROOT, 'documents', documentId, 'chunks', String(index).padStart(4, '0'));
}

function responseFrom(dir) {
  const direct = path.join(dir, 'response.xml');
  if (fs.existsSync(direct)) return { text: fs.readFileSync(direct, 'utf8'), source: 'response.xml' };
  const raw = readJson(path.join(dir, 'raw-response.json'));
  const text = raw?.choices?.[0]?.message?.content;
  return typeof text === 'string' ? { text, source: 'raw-response.json' } : null;
}

function saveChunk(dir, recovered, source) {
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, 'response.xml');
  if (fs.existsSync(target)) {
    const backup = path.join(dir, 'response.pre-footnote-free-salvage.xml');
    if (!fs.existsSync(backup)) fs.copyFileSync(target, backup);
  }
  writeText(target, recovered.xml);
  writeJson(path.join(dir, 'parsed.json'), recovered.parsed);
  writeJson(path.join(dir, 'validation.json'), recovered.validation);
  const old = readJson(path.join(dir, 'result.json'), {});
  writeJson(path.join(dir, 'result.json'), { ...old, validation: recovered.validation,
    mechanicallySalvaged: true, footnotesSkipped: true, salvageSource: source,
    recoveryMethod: recovered.method, salvagedAt: new Date().toISOString() });
}

function promote(document, chunks) {
  const parts = chunks.map(chunk => fs.readFileSync(path.join(dirFor(document.documentId, chunk.chunkIndex), 'response.xml'), 'utf8'));
  const xml = combineXml(parts);
  const parsed = parseSichosXml(xml);
  const validation = validateForJob(document, parsed, { throwOnError: true });
  const dir = path.join(ROOT, 'documents', document.documentId);
  writeText(path.join(dir, 'translation.xml'), xml);
  writeJson(path.join(dir, 'translation.parsed.json'), parsed);
  writeJson(path.join(dir, 'translation.validation.json'), validation);
  return { documentId: document.documentId, title: document.title, chunks: chunks.length,
    footnotesSkipped: true, mechanicallySalvagedAt: new Date().toISOString() };
}

function main() {
  const state = readJson(STATE, { completed: [], pending: [], failed: [] });
  const completed = new Set((state.completed || []).map(item => item.documentId));
  const corpus = loadCorpus();
  const reports = [];
  const promoted = [];
  for (const [documentId, sourceDoc] of Object.entries(corpus.collections?.Farbrengens?.documents || {})) {
    if (completed.has(documentId)) continue;
    const document = extractDocument(documentId, sourceDoc);
    if (!document.meaningfulSubsectionCount) continue;
    const chunks = chunkDocument(document, MAX_CHARS);
    let valid = 0;
    let recovered = 0;
    const details = [];
    for (const chunk of chunks) {
      const dir = dirFor(documentId, chunk.chunkIndex);
      const response = responseFrom(dir);
      if (!response) { details.push({ chunkIndex: chunk.chunkIndex, status: 'no_response' }); continue; }
      try {
        if (validateForJob(chunk, parseSichosXml(response.text)).ok) {
          valid++; details.push({ chunkIndex: chunk.chunkIndex, status: 'valid' }); continue;
        }
      } catch {}
      const result = recoverExactChunk(chunk, response.text);
      if (result.ok) {
        saveChunk(dir, result, response.source); recovered++;
        details.push({ chunkIndex: chunk.chunkIndex, status: 'recovered', method: result.method });
      } else details.push({ chunkIndex: chunk.chunkIndex, status: 'failed', reason: result.reason });
    }
    if (valid + recovered === chunks.length) {
      try { promoted.push(promote(document, chunks)); } catch (error) { details.push({ status: 'promotion_failed', error: error.message }); }
    }
    reports.push({ documentId, chunks: chunks.length, valid, recovered, details });
  }
  for (const item of promoted) {
    state.completed = (state.completed || []).filter(entry => entry.documentId !== item.documentId);
    state.completed.push(item);
    state.pending = (state.pending || []).filter(entry => entry.documentId !== item.documentId);
    state.failed = (state.failed || []).filter(entry => entry.documentId !== item.documentId);
  }
  writeJson(STATE, state);
  const summary = { generatedAt: new Date().toISOString(), footnotesSkipped: true,
    documentsAudited: reports.length, newlyRecoveredChunks: reports.reduce((sum, item) => sum + item.recovered, 0),
    newlyPromotedDocuments: promoted.length, completedDocumentsNow: state.completed.length };
  fs.mkdirSync(OUT, { recursive: true });
  writeJson(path.join(OUT, 'mechanical-salvage-report.json'), { summary, promoted, reports });
  console.log(JSON.stringify({ summary, promoted, outDir: OUT }, null, 2));
}

main();
