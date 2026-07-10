// B"H
/**
 * Audit failed farbrengens for strictly reusable translated chunks.
 *
 * The Awtsmoos does not discard a true vessel merely because its neighbor
 * shattered. Each saved response must stand again before its exact source,
 * indices, footnotes, and XML boundaries before it may be called salvageable.
 */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson, writeText } from './save_output.mjs';
import { extractDocument, loadCorpus, chunkDocument } from './corpus_utils.mjs';
import { parseSichosXml, validateParsed } from './parse_xml.mjs';

const ROOT = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const STATE = path.join(ROOT, 'swarm-state.json');
const MAX_CHARS = 3500;

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function chunkDir(documentId, index) {
  return path.join(ROOT, 'documents', documentId, 'chunks', String(index).padStart(4, '0'));
}

function auditChunk(documentId, chunk) {
  const dir = chunkDir(documentId, chunk.chunkIndex);
  const responseFile = path.join(dir, 'response.xml');
  const sourceFile = path.join(dir, 'source.json');
  const result = {
    chunkIndex: chunk.chunkIndex,
    combinedChars: chunk.combinedChars,
    sectionIndices: chunk.sections.map(section => section.sectionIndex),
    dir,
    reusable: false,
    reason: ''
  };
  if (!fs.existsSync(responseFile)) {
    result.reason = 'missing_response_xml';
    return result;
  }
  if (!fs.existsSync(sourceFile)) {
    result.reason = 'missing_saved_source';
    return result;
  }
  const savedSource = readJson(sourceFile);
  if (!savedSource) {
    result.reason = 'unreadable_saved_source';
    return result;
  }
  const expectedKeys = chunk.sections.flatMap(v => v.paragraphs.map(s => `${v.sectionIndex}:${s.paragraphIndex}`));
  const savedKeys = (savedSource.sections || []).flatMap(v => (v.paragraphs || []).map(s => `${v.sectionIndex}:${s.paragraphIndex}`));
  if (JSON.stringify(expectedKeys) !== JSON.stringify(savedKeys)) {
    result.reason = 'stale_chunk_source_layout';
    return result;
  }
  try {
    const xml = fs.readFileSync(responseFile, 'utf8');
    const parsed = parseSichosXml(xml);
    const validation = validateParsed(chunk, parsed);
    result.validationErrors = validation.errors;
    if (!validation.ok) {
      result.reason = 'validation_failed';
      return result;
    }
    result.reusable = true;
    result.reason = 'strictly_valid';
    result.usage = readJson(path.join(dir, 'result.json'), {})?.usage || null;
    return result;
  } catch (error) {
    result.reason = 'parse_failed';
    result.error = error.message;
    return result;
  }
}

function markdown(summary, documents) {
  const lines = [
    'B"H', '', '# Failed-document chunk salvage audit', '',
    `- Failed documents audited: ${summary.failedDocuments}`,
    `- Documents with at least one reusable chunk: ${summary.documentsWithSalvage}`,
    `- Fully recoverable documents: ${summary.fullyRecoverableDocuments}`,
    `- Reusable chunks: ${summary.reusableChunks}`,
    `- Retry-required chunks: ${summary.retryRequiredChunks}`,
    `- Reusable source characters: ${summary.reusableSourceChars}`,
    `- Retry-required source characters: ${summary.retryRequiredSourceChars}`,
    '', '## Documents', ''
  ];
  for (const doc of documents) {
    lines.push(`- \`${doc.documentId}\` — ${doc.title} — ${doc.reusableChunks}/${doc.totalChunks} reusable chunks — ${doc.status}`);
  }
  return lines.join('\n');
}

function main() {
  const state = readJson(STATE, { failed: [] });
  const failedIds = [...new Set((state.failed || []).map(item => item.documentId))];
  const corpus = loadCorpus();
  const documents = [];
  for (const documentId of failedIds) {
    const sourceDoc = corpus.collections?.Farbrengens?.documents?.[documentId];
    if (!sourceDoc) {
      documents.push({ documentId, title: '', totalChunks: 0, reusableChunks: 0, status: 'source_missing', chunks: [] });
      continue;
    }
    const document = extractDocument(documentId, sourceDoc);
    const chunks = chunkDocument(document, MAX_CHARS);
    const audited = chunks.map(chunk => auditChunk(documentId, chunk));
    const reusable = audited.filter(item => item.reusable);
    const status = reusable.length === chunks.length ? 'fully_recoverable' : reusable.length ? 'partially_salvaged' : 'retry_all';
    documents.push({
      documentId,
      title: document.title,
      totalChunks: chunks.length,
      reusableChunks: reusable.length,
      retryRequiredChunks: chunks.length - reusable.length,
      reusableSourceChars: reusable.reduce((sum, item) => sum + item.combinedChars, 0),
      retryRequiredSourceChars: audited.filter(item => !item.reusable).reduce((sum, item) => sum + item.combinedChars, 0),
      status,
      chunks: audited
    });
  }
  const summary = {
    generatedAt: new Date().toISOString(),
    maxChars: MAX_CHARS,
    failedDocuments: documents.length,
    documentsWithSalvage: documents.filter(doc => doc.reusableChunks > 0).length,
    fullyRecoverableDocuments: documents.filter(doc => doc.status === 'fully_recoverable').length,
    reusableChunks: documents.reduce((sum, doc) => sum + doc.reusableChunks, 0),
    retryRequiredChunks: documents.reduce((sum, doc) => sum + doc.retryRequiredChunks, 0),
    reusableSourceChars: documents.reduce((sum, doc) => sum + doc.reusableSourceChars, 0),
    retryRequiredSourceChars: documents.reduce((sum, doc) => sum + doc.retryRequiredSourceChars, 0)
  };
  const outDir = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'salvage');
  fs.mkdirSync(outDir, { recursive: true });
  writeJson(path.join(outDir, 'failed-chunk-salvage.json'), { summary, documents });
  writeJson(path.join(outDir, 'reusable-chunks.json'), documents.flatMap(doc => doc.chunks.filter(chunk => chunk.reusable).map(chunk => ({ documentId: doc.documentId, ...chunk }))));
  writeJson(path.join(outDir, 'retry-required-chunks.json'), documents.flatMap(doc => doc.chunks.filter(chunk => !chunk.reusable).map(chunk => ({ documentId: doc.documentId, ...chunk }))));
  writeText(path.join(outDir, 'failed-chunk-salvage.md'), markdown(summary, documents));
  console.log(JSON.stringify({ summary, outDir }, null, 2));
}

main();
