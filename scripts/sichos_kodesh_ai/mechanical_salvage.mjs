// B"H
/**
 * Mechanical salvage of already-returned model text. No API calls.
 *
 * The Awtsmoos reveals what was already present beneath wrappers and disorder;
 * this file never invents English, never paraphrases, and never fills a gap.
 */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson, writeText } from './save_output.mjs';
import { chunkDocument, extractDocument, loadCorpus } from './corpus_utils.mjs';
import { parseSichosXml, validateParsed } from './parse_xml.mjs';
import { combineXml } from './document_runner.mjs';

const ROOT = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const STATE_FILE = path.join(ROOT, 'swarm-state.json');
const OUT_DIR = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'mechanical-salvage');
const MAX_CHARS = 3500;

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function chunkDir(documentId, index) {
  return path.join(ROOT, 'documents', documentId, 'chunks', String(index).padStart(4, '0'));
}

function sourceResponse(dir) {
  const direct = path.join(dir, 'response.xml');
  if (fs.existsSync(direct)) return { text: fs.readFileSync(direct, 'utf8'), source: 'response.xml' };
  const raw = readJson(path.join(dir, 'raw-response.json'));
  const text = raw?.choices?.[0]?.message?.content;
  return typeof text === 'string' ? { text, source: 'raw-response.json' } : null;
}

function decodeEntities(value) {
  return String(value).replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}

function escapeText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function normalizeEnglish(raw) {
  return String(raw)
    .replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?(?:p|div|span|strong|b|i|em)\b[^>]*>/gi, '')
    .trim();
}

function extractSup(raw) {
  return [...String(raw).matchAll(/<sup\s*>(\d{1,3})<\/sup>/gi)].map(match => match[1]);
}

function wrapBareFootnotes(raw, expected) {
  let output = raw;
  const existing = extractSup(output);
  if (JSON.stringify(existing) === JSON.stringify(expected)) return output;
  if (existing.length) return null;
  let cursor = 0;
  for (const number of expected) {
    const regex = new RegExp(`(?<![\\d>])${number}(?![\\d<])`, 'g');
    regex.lastIndex = cursor;
    const match = regex.exec(output);
    if (!match) return null;
    output = output.slice(0, match.index) + `<sup>${number}</sup>` + output.slice(match.index + number.length);
    cursor = match.index + `<sup>${number}</sup>`.length;
  }
  return extractSup(output).join(',') === expected.join(',') ? output : null;
}

function candidateRoot(text) {
  const clean = String(text || '').replace(/^\s*```(?:xml)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const start = clean.indexOf('<translation');
  const end = clean.lastIndexOf('</translation>');
  if (start >= 0 && end > start) return clean.slice(start, end + '</translation>'.length);
  const firstV = clean.search(/<v\b/i);
  const lastV = clean.toLowerCase().lastIndexOf('</v>');
  if (firstV >= 0 && lastV > firstV) return `<translation>${clean.slice(firstV, lastV + 4)}</translation>`;
  return clean;
}

function indexedBlocks(text, tag) {
  const regex = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const map = new Map();
  const duplicates = new Set();
  for (const match of String(text).matchAll(regex)) {
    const index = match[1].match(/\bindex\s*=\s*["'](\d+)["']/i)?.[1];
    if (index == null) continue;
    if (map.has(Number(index))) duplicates.add(Number(index));
    else map.set(Number(index), match[2]);
  }
  return { map, duplicates };
}

function recoverChunk(chunk, responseText) {
  const root = candidateRoot(responseText);
  const vBlocks = indexedBlocks(root, 'v');
  if (vBlocks.duplicates.size) return { ok: false, reason: 'duplicate_v_indices' };
  const recoveredVs = [];

  for (const expectedV of chunk.sections) {
    const vInner = vBlocks.map.get(expectedV.sectionIndex);
    if (vInner == null) return { ok: false, reason: `missing_v_${expectedV.sectionIndex}` };
    const sBlocks = indexedBlocks(vInner, 's');
    if (sBlocks.duplicates.size) return { ok: false, reason: `duplicate_s_in_v_${expectedV.sectionIndex}` };
    const recoveredSs = [];

    for (const expectedS of expectedV.paragraphs) {
      const sInner = sBlocks.map.get(expectedS.paragraphIndex);
      if (sInner == null) return { ok: false, reason: `missing_s_${expectedV.sectionIndex}_${expectedS.paragraphIndex}` };
      const enMatches = [...sInner.matchAll(/<en\b[^>]*>([\s\S]*?)<\/en>/gi)];
      const selfClosing = /<en\s*\/>/i.test(sInner);
      if (enMatches.length !== 1 || selfClosing) return { ok: false, reason: `bad_en_${expectedV.sectionIndex}_${expectedS.paragraphIndex}` };
      let english = normalizeEnglish(enMatches[0][1]);
      if (!english) return { ok: false, reason: `empty_en_${expectedV.sectionIndex}_${expectedS.paragraphIndex}` };
      const expectedFootnotes = expectedS.footnotes || [];
      english = wrapBareFootnotes(english, expectedFootnotes);
      if (english == null) return { ok: false, reason: `footnotes_${expectedV.sectionIndex}_${expectedS.paragraphIndex}` };
      const protectedSup = [];
      english = english.replace(/<sup\s*>(\d{1,3})<\/sup>/gi, (_, number) => {
        protectedSup.push(number);
        return `___SUP_${protectedSup.length - 1}___`;
      });
      if (/<[^>]+>/.test(english)) return { ok: false, reason: `unexpected_tag_${expectedV.sectionIndex}_${expectedS.paragraphIndex}` };
      english = escapeText(decodeEntities(english));
      english = english.replace(/___SUP_(\d+)___/g, (_, index) => `<sup>${protectedSup[Number(index)]}</sup>`);
      recoveredSs.push(`<s index="${expectedS.paragraphIndex}"><en>${english}</en></s>`);
    }
    recoveredVs.push(`<v index="${expectedV.sectionIndex}">\n${recoveredSs.join('\n')}\n</v>`);
  }

  const xml = `<translation>\n${recoveredVs.join('\n')}\n</translation>`;
  try {
    const parsed = parseSichosXml(xml);
    const validation = validateParsed(chunk, parsed);
    return validation.ok ? { ok: true, xml, validation } : { ok: false, reason: 'strict_validation_failed', errors: validation.errors };
  } catch (error) {
    return { ok: false, reason: 'strict_parse_failed', error: error.message };
  }
}

function writeRecovered(dir, recovered, originalSource) {
  const original = path.join(dir, 'response.xml');
  if (fs.existsSync(original)) {
    const backup = path.join(dir, 'response.pre-mechanical-salvage.xml');
    if (!fs.existsSync(backup)) fs.copyFileSync(original, backup);
  }
  writeText(original, recovered.xml);
  writeJson(path.join(dir, 'parsed.json'), parseSichosXml(recovered.xml));
  writeJson(path.join(dir, 'validation.json'), recovered.validation);
  const oldResult = readJson(path.join(dir, 'result.json'), {});
  writeJson(path.join(dir, 'result.json'), {
    ...oldResult,
    validation: recovered.validation,
    mechanicallySalvaged: true,
    salvageSource: originalSource,
    salvagedAt: new Date().toISOString()
  });
}

function promoteDocument(document, chunks) {
  const parts = chunks.map(chunk => fs.readFileSync(path.join(chunkDir(document.documentId, chunk.chunkIndex), 'response.xml'), 'utf8'));
  const xml = combineXml(parts);
  const parsed = parseSichosXml(xml);
  const validation = validateParsed(document, parsed, { throwOnError: true });
  const dir = path.join(ROOT, 'documents', document.documentId);
  writeText(path.join(dir, 'translation.xml'), xml);
  writeJson(path.join(dir, 'translation.parsed.json'), parsed);
  writeJson(path.join(dir, 'translation.validation.json'), validation);
  return { documentId: document.documentId, title: document.title, chunks: chunks.length, mechanicallySalvagedAt: new Date().toISOString() };
}

function main() {
  const state = readJson(STATE_FILE, { completed: [], pending: [] });
  const completed = new Set((state.completed || []).map(item => item.documentId));
  const corpus = loadCorpus();
  const reports = [];
  const promoted = [];

  for (const [documentId, sourceDoc] of Object.entries(corpus.collections?.Farbrengens?.documents || {})) {
    if (completed.has(documentId)) continue;
    const document = extractDocument(documentId, sourceDoc);
    if (!document.meaningfulSubsectionCount) continue;
    const chunks = chunkDocument(document, MAX_CHARS);
    let recoveredCount = 0;
    let alreadyValid = 0;
    const details = [];

    for (const chunk of chunks) {
      const dir = chunkDir(documentId, chunk.chunkIndex);
      const response = sourceResponse(dir);
      if (!response) {
        details.push({ chunkIndex: chunk.chunkIndex, status: 'no_saved_response' });
        continue;
      }
      try {
        const strict = validateParsed(chunk, parseSichosXml(response.text));
        if (strict.ok) {
          alreadyValid++;
          details.push({ chunkIndex: chunk.chunkIndex, status: 'already_valid' });
          continue;
        }
      } catch {}
      const recovered = recoverChunk(chunk, response.text);
      if (recovered.ok) {
        fs.mkdirSync(dir, { recursive: true });
        writeRecovered(dir, recovered, response.source);
        recoveredCount++;
        details.push({ chunkIndex: chunk.chunkIndex, status: 'mechanically_recovered', source: response.source });
      } else {
        details.push({ chunkIndex: chunk.chunkIndex, status: 'not_recoverable', reason: recovered.reason, errors: recovered.errors });
      }
    }

    let promotedNow = false;
    if (alreadyValid + recoveredCount === chunks.length) {
      try {
        promoted.push(promoteDocument(document, chunks));
        promotedNow = true;
      } catch (error) {
        details.push({ status: 'promotion_failed', error: error.message });
      }
    }
    reports.push({ documentId, title: document.title, chunks: chunks.length, alreadyValid, recoveredCount, promoted: promotedNow, details });
  }

  for (const item of promoted) {
    state.completed = (state.completed || []).filter(entry => entry.documentId !== item.documentId);
    state.completed.push(item);
    state.pending = (state.pending || []).filter(entry => entry.documentId !== item.documentId);
    state.failed = (state.failed || []).filter(entry => entry.documentId !== item.documentId);
  }
  state.progressPercent = Number((((state.completed || []).length / state.total) * 100).toFixed(2));
  writeJson(STATE_FILE, state);

  const summary = {
    generatedAt: new Date().toISOString(),
    documentsAudited: reports.length,
    documentsWithNewSalvage: reports.filter(item => item.recoveredCount > 0).length,
    newlyRecoveredChunks: reports.reduce((sum, item) => sum + item.recoveredCount, 0),
    alreadyValidChunks: reports.reduce((sum, item) => sum + item.alreadyValid, 0),
    newlyPromotedDocuments: promoted.length,
    completedDocumentsNow: state.completed.length,
    pendingDocumentsNow: state.pending.length
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  writeJson(path.join(OUT_DIR, 'mechanical-salvage-report.json'), { summary, promoted, reports });
  writeJson(path.join(OUT_DIR, 'mechanically-recovered-chunks.json'), reports.flatMap(doc => doc.details.filter(item => item.status === 'mechanically_recovered').map(item => ({ documentId: doc.documentId, ...item }))));
  console.log(JSON.stringify({ summary, promoted, outDir: OUT_DIR }, null, 2));
}

main();
