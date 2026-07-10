// B"H
/** Build an exact repair plan: reuse valid chunks and list only broken chunks. */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson, writeText } from './save_output.mjs';
import { chunkDocument, extractDocument, loadCorpus } from './corpus_utils.mjs';
import { parseSichosXml, validateParsed } from './parse_xml.mjs';

const ROOT = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const STATE_FILE = path.join(ROOT, 'swarm-state.json');
const OUT_DIR = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'repair');
const MAX_CHARS = 3500;

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function chunkPath(documentId, chunkIndex, file) {
  return path.join(ROOT, 'documents', documentId, 'chunks', String(chunkIndex).padStart(4, '0'), file);
}

function inspectChunk(documentId, chunk) {
  const xmlFile = chunkPath(documentId, chunk.chunkIndex, 'response.xml');
  if (!fs.existsSync(xmlFile)) return { reusable: false, reason: 'missing_response_xml' };
  try {
    const parsed = parseSichosXml(fs.readFileSync(xmlFile, 'utf8'));
    const validation = validateParsed(chunk, parsed);
    return validation.ok
      ? { reusable: true, reason: 'strictly_valid' }
      : { reusable: false, reason: 'validation_failed', errors: validation.errors };
  } catch (error) {
    return { reusable: false, reason: 'parse_failed', error: error.message };
  }
}

function markdown(summary, documents) {
  const lines = ['B"H', '', '# Repair-only corpus plan', ''];
  for (const [key, value] of Object.entries(summary)) lines.push(`- ${key}: ${value}`);
  lines.push('', '## Pending documents', '');
  for (const doc of documents) {
    lines.push(`- \`${doc.documentId}\` — ${doc.repairChunks}/${doc.totalChunks} chunks require repair; ${doc.reusableChunks} reusable`);
  }
  return lines.join('\n');
}

function main() {
  const state = readJson(STATE_FILE, { completed: [] });
  const completed = new Set((state.completed || []).map(item => item.documentId));
  const corpus = loadCorpus();
  const docs = Object.entries(corpus.collections?.Farbrengens?.documents || {});
  const documents = [];

  for (const [documentId, sourceDoc] of docs) {
    if (completed.has(documentId)) continue;
    const document = extractDocument(documentId, sourceDoc);
    if (!document.meaningfulSubsectionCount) continue;
    const chunks = chunkDocument(document, MAX_CHARS);
    const inspected = chunks.map(chunk => ({
      chunkIndex: chunk.chunkIndex,
      combinedChars: chunk.combinedChars,
      ...inspectChunk(documentId, chunk)
    }));
    const broken = inspected.filter(item => !item.reusable);
    documents.push({
      documentId,
      title: document.title,
      totalChunks: chunks.length,
      reusableChunks: inspected.length - broken.length,
      repairChunks: broken.length,
      reusableChars: inspected.filter(item => item.reusable).reduce((sum, item) => sum + item.combinedChars, 0),
      repairChars: broken.reduce((sum, item) => sum + item.combinedChars, 0),
      chunks: inspected
    });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    completedDocuments: completed.size,
    pendingDocuments: documents.length,
    reusableChunks: documents.reduce((sum, doc) => sum + doc.reusableChunks, 0),
    repairChunks: documents.reduce((sum, doc) => sum + doc.repairChunks, 0),
    reusableChars: documents.reduce((sum, doc) => sum + doc.reusableChars, 0),
    repairChars: documents.reduce((sum, doc) => sum + doc.repairChars, 0),
    maxChars: MAX_CHARS
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  writeJson(path.join(OUT_DIR, 'repair-plan.json'), { summary, documents });
  writeJson(path.join(OUT_DIR, 'repair-documents.json'), documents.map(doc => ({ documentId: doc.documentId, repairChunks: doc.chunks.filter(chunk => !chunk.reusable).map(chunk => chunk.chunkIndex) })));
  writeText(path.join(OUT_DIR, 'repair-plan.md'), markdown(summary, documents));
  console.log(JSON.stringify({ summary, outDir: OUT_DIR }, null, 2));
}

main();
