// B"H
/** Translate one complete farbrengen in validated chunks. */
import fs from 'fs';
import path from 'path';
import { buildPrompt } from './build_prompt.mjs';
import { callDeepSeek } from './deepseek_client.mjs';
import { parseSichosXml, validateParsed } from './parse_xml.mjs';
import { estimateCost } from './cost_estimate.mjs';
import { writeJson, writeText } from './save_output.mjs';
import { chunkDocument } from './corpus_utils.mjs';

function chunkDir(documentDir, index) {
  return path.join(documentDir, 'chunks', String(index).padStart(4, '0'));
}

function validatedChunkExists(dir) {
  const file = path.join(dir, 'validation.json');
  if (!fs.existsSync(file)) return false;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')).ok === true; } catch { return false; }
}

function combineXml(parts) {
  const bodies = parts.map(xml => String(xml).replace(/^\s*<translation>\s*/i, '').replace(/\s*<\/translation>\s*$/i, '').trim());
  return `<translation>\n${bodies.join('\n')}\n</translation>`;
}

export async function runDocument(document, options = {}) {
  const { rootDir, model = 'deepseek-chat', maxChars = 12000, dryRun = false, force = false } = options;
  const documentDir = path.join(rootDir, 'documents', document.documentId);
  fs.mkdirSync(documentDir, { recursive: true });
  writeJson(path.join(documentDir, 'source.json'), document);
  const chunks = chunkDocument(document, maxChars);
  const results = [];
  for (const chunk of chunks) {
    const dir = chunkDir(documentDir, chunk.chunkIndex);
    fs.mkdirSync(dir, { recursive: true });
    const prompt = buildPrompt(chunk);
    writeJson(path.join(dir, 'source.json'), chunk);
    writeText(path.join(dir, 'prompt.txt'), prompt);
    if (dryRun) {
      results.push({ chunkIndex: chunk.chunkIndex, dryRun: true, chars: chunk.combinedChars });
      continue;
    }
    if (!force && validatedChunkExists(dir)) {
      const saved = JSON.parse(fs.readFileSync(path.join(dir, 'result.json'), 'utf8'));
      results.push(saved);
      continue;
    }
    const response = await callDeepSeek({ prompt, model });
    writeJson(path.join(dir, 'request.json'), response.sanitizedRequest);
    writeJson(path.join(dir, 'raw-response.json'), response.rawResponse);
    writeText(path.join(dir, 'response.xml'), response.xml.trim());
    const parsed = parseSichosXml(response.xml);
    const validation = validateParsed(chunk, parsed, { throwOnError: false });
    const result = { chunkIndex: chunk.chunkIndex, validation, usage: response.usage, cost: estimateCost(response.usage) };
    writeJson(path.join(dir, 'parsed.json'), parsed);
    writeJson(path.join(dir, 'validation.json'), validation);
    writeJson(path.join(dir, 'result.json'), result);
    if (!validation.ok) throw new Error(`Validation failed for ${document.documentId} chunk ${chunk.chunkIndex}`);
    results.push(result);
  }
  if (!dryRun) {
    const xmlParts = chunks.map(chunk => fs.readFileSync(path.join(chunkDir(documentDir, chunk.chunkIndex), 'response.xml'), 'utf8'));
    writeText(path.join(documentDir, 'translation.xml'), combineXml(xmlParts));
  }
  const summary = { documentId: document.documentId, title: document.title, chunks: chunks.length, dryRun, results };
  writeJson(path.join(documentDir, 'summary.json'), summary);
  return summary;
}
