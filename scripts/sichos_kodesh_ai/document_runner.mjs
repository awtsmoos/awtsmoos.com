// B"H
/** Translate one complete farbrengen in validated, resumable chunks. */
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function readValidatedChunk(dir, chunk) {
  const files = ['validation.json', 'result.json', 'response.xml'];
  if (!files.every(name => fs.existsSync(path.join(dir, name)))) return null;
  try {
    const xml = fs.readFileSync(path.join(dir, 'response.xml'), 'utf8');
    const parsed = parseSichosXml(xml);
    const validation = validateParsed(chunk, parsed);
    if (!validation.ok) return null;
    return JSON.parse(fs.readFileSync(path.join(dir, 'result.json'), 'utf8'));
  } catch {
    return null;
  }
}

export function combineXml(parts) {
  const bodies = parts.map(xml => String(xml)
    .replace(/^\s*<translation>\s*/i, '')
    .replace(/\s*<\/translation>\s*$/i, '')
    .trim());
  return `<translation>\n${bodies.join('\n')}\n</translation>`;
}

async function translateChunk(chunk, options) {
  const { model, retries, retryBaseMs, client } = options;
  const prompt = buildPrompt(chunk);
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await client({ prompt, model });
      const parsed = parseSichosXml(response.xml);
      const validation = validateParsed(chunk, parsed);
      if (!validation.ok) throw new Error(validation.errors.join('\n'));
      return { prompt, response, parsed, validation, attempt };
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await sleep(retryBaseMs * (2 ** attempt));
    }
  }
  throw lastError;
}

export async function runDocument(document, options = {}) {
  const rootDir = options.rootDir;
  const model = options.model || 'deepseek-chat';
  const maxChars = options.maxChars || 12000;
  const dryRun = Boolean(options.dryRun);
  const force = Boolean(options.force);
  const retries = Number.isInteger(options.retries) ? options.retries : 3;
  const retryBaseMs = options.retryBaseMs ?? 1500;
  const client = options.client || callDeepSeek;
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
      results.push({ chunkIndex: chunk.chunkIndex, dryRun: true, chars: chunk.combinedChars, exceedsTarget: chunk.exceedsTarget });
      continue;
    }
    const reused = !force ? readValidatedChunk(dir, chunk) : null;
    if (reused) {
      results.push({ ...reused, reused: true });
      continue;
    }
    const translated = await translateChunk(chunk, { model, retries, retryBaseMs, client });
    const { response, parsed, validation, attempt } = translated;
    writeJson(path.join(dir, 'request.json'), response.sanitizedRequest || { model });
    writeJson(path.join(dir, 'raw-response.json'), response.rawResponse || {});
    writeText(path.join(dir, 'response.xml'), response.xml.trim());
    const result = { chunkIndex: chunk.chunkIndex, validation, usage: response.usage, cost: estimateCost(response.usage), attempts: attempt + 1 };
    writeJson(path.join(dir, 'parsed.json'), parsed);
    writeJson(path.join(dir, 'validation.json'), validation);
    writeJson(path.join(dir, 'result.json'), result);
    results.push(result);
  }
  if (!dryRun) {
    const parts = chunks.map(chunk => fs.readFileSync(path.join(chunkDir(documentDir, chunk.chunkIndex), 'response.xml'), 'utf8'));
    const stitchedXml = combineXml(parts);
    const stitchedParsed = parseSichosXml(stitchedXml);
    const stitchedValidation = validateParsed(document, stitchedParsed, { throwOnError: true });
    writeText(path.join(documentDir, 'translation.xml'), stitchedXml);
    writeJson(path.join(documentDir, 'translation.parsed.json'), stitchedParsed);
    writeJson(path.join(documentDir, 'translation.validation.json'), stitchedValidation);
  }
  const summary = { documentId: document.documentId, title: document.title, chunks: chunks.length, dryRun, results };
  writeJson(path.join(documentDir, 'summary.json'), summary);
  return summary;
}
