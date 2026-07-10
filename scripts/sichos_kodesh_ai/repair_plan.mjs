// B"H
/** Build the repair plan using strict structure with footnotes intentionally skipped. */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson, writeText } from './save_output.mjs';
import { chunkDocument, extractDocument, loadCorpus } from './corpus_utils.mjs';
import { parseSichosXml } from './parse_xml.mjs';
import { validateForJob } from './translation_policy.mjs';

const ROOT = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const STATE_FILE = path.join(ROOT, 'swarm-state.json');
const OUT_DIR = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'repair');
const MAX_CHARS = 3500;

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function inspectChunk(documentId, chunk) {
  const dir = path.join(ROOT, 'documents', documentId, 'chunks', String(chunk.chunkIndex).padStart(4, '0'));
  const file = path.join(dir, 'response.xml');
  if (!fs.existsSync(file)) return { reusable: false, reason: 'missing_response_xml' };
  try {
    const validation = validateForJob(chunk, parseSichosXml(fs.readFileSync(file, 'utf8')));
    return validation.ok ? { reusable: true, reason: 'valid_footnote_free' }
      : { reusable: false, reason: 'validation_failed', errors: validation.errors };
  } catch (error) {
    return { reusable: false, reason: 'parse_failed', error: error.message };
  }
}

function main() {
  const state = readJson(STATE_FILE, { completed: [] });
  const completed = new Set((state.completed || []).map(item => item.documentId));
  const corpus = loadCorpus();
  const documents = [];
  for (const [documentId, sourceDoc] of Object.entries(corpus.collections?.Farbrengens?.documents || {})) {
    if (completed.has(documentId)) continue;
    const document = extractDocument(documentId, sourceDoc);
    if (!document.meaningfulSubsectionCount) continue;
    const chunks = chunkDocument(document, MAX_CHARS);
    const inspected = chunks.map(chunk => ({ chunkIndex: chunk.chunkIndex,
      combinedChars: chunk.combinedChars, ...inspectChunk(documentId, chunk) }));
    const broken = inspected.filter(item => !item.reusable);
    documents.push({ documentId, title: document.title, totalChunks: chunks.length,
      reusableChunks: inspected.length - broken.length, repairChunks: broken.length,
      reusableChars: inspected.filter(item => item.reusable).reduce((sum, item) => sum + item.combinedChars, 0),
      repairChars: broken.reduce((sum, item) => sum + item.combinedChars, 0), chunks: inspected });
  }
  const summary = { generatedAt: new Date().toISOString(), footnotesSkipped: true,
    completedDocuments: completed.size, pendingDocuments: documents.length,
    reusableChunks: documents.reduce((sum, doc) => sum + doc.reusableChunks, 0),
    repairChunks: documents.reduce((sum, doc) => sum + doc.repairChunks, 0),
    reusableChars: documents.reduce((sum, doc) => sum + doc.reusableChars, 0),
    repairChars: documents.reduce((sum, doc) => sum + doc.repairChars, 0), maxChars: MAX_CHARS };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  writeJson(path.join(OUT_DIR, 'repair-plan.json'), { summary, documents });
  writeJson(path.join(OUT_DIR, 'repair-documents.json'), documents.map(doc => ({
    documentId: doc.documentId,
    repairChunks: doc.chunks.filter(chunk => !chunk.reusable).map(chunk => chunk.chunkIndex)
  })));
  writeText(path.join(OUT_DIR, 'repair-plan.md'), ['B"H', '', '# Footnote-free repair plan', '',
    ...Object.entries(summary).map(([key, value]) => `- ${key}: ${value}`)].join('\n'));
  console.log(JSON.stringify({ summary, outDir: OUT_DIR }, null, 2));
}

main();
