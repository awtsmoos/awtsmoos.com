// B"H
/** Promote only fully recoverable failed documents after full-document validation. */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson, writeText } from './save_output.mjs';
import { extractDocument, loadCorpus, chunkDocument } from './corpus_utils.mjs';
import { combineXml } from './document_runner.mjs';
import { parseSichosXml, validateParsed } from './parse_xml.mjs';

const ROOT = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const AUDIT = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'salvage', 'failed-chunk-salvage.json');
const STATE = path.join(ROOT, 'swarm-state.json');
const MAX_CHARS = 3500;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function chunkDir(documentId, index) {
  return path.join(ROOT, 'documents', documentId, 'chunks', String(index).padStart(4, '0'));
}

function promote(documentId, sourceDoc) {
  const document = extractDocument(documentId, sourceDoc);
  const chunks = chunkDocument(document, MAX_CHARS);
  const parts = chunks.map(chunk => fs.readFileSync(path.join(chunkDir(documentId, chunk.chunkIndex), 'response.xml'), 'utf8'));
  const xml = combineXml(parts);
  const parsed = parseSichosXml(xml);
  const validation = validateParsed(document, parsed, { throwOnError: true });
  const dir = path.join(ROOT, 'documents', documentId);
  writeText(path.join(dir, 'translation.xml'), xml);
  writeJson(path.join(dir, 'translation.parsed.json'), parsed);
  writeJson(path.join(dir, 'translation.validation.json'), validation);
  writeJson(path.join(dir, 'summary.json'), {
    documentId,
    title: document.title,
    chunks: chunks.length,
    salvaged: true,
    validation
  });
  return { documentId, title: document.title, chunks: chunks.length, salvagedAt: new Date().toISOString() };
}

function main() {
  const audit = readJson(AUDIT);
  const corpus = loadCorpus();
  const state = readJson(STATE);
  const candidates = audit.documents.filter(document => document.status === 'fully_recoverable');
  const promoted = [];
  const rejected = [];
  for (const candidate of candidates) {
    try {
      const sourceDoc = corpus.collections?.Farbrengens?.documents?.[candidate.documentId];
      if (!sourceDoc) throw new Error('source document missing');
      promoted.push(promote(candidate.documentId, sourceDoc));
    } catch (error) {
      rejected.push({ documentId: candidate.documentId, error: error.stack || String(error) });
    }
  }
  for (const item of promoted) {
    state.completed = (state.completed || []).filter(entry => entry.documentId !== item.documentId);
    state.completed.push(item);
    state.failed = (state.failed || []).filter(entry => entry.documentId !== item.documentId);
  }
  state.progressPercent = Number((((state.completed || []).length / state.total) * 100).toFixed(2));
  writeJson(STATE, state);
  const report = { generatedAt: new Date().toISOString(), promoted, rejected };
  writeJson(path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'salvage', 'salvage-promoted.json'), report);
  console.log(JSON.stringify(report, null, 2));
}

main();
