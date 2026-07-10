// B"H
/** Translate one farbrengen with resumable chunks and durable failed attempts. */
import fs from 'fs';
import path from 'path';
import { buildPrompt } from './build_prompt.mjs';
import { callDeepSeek, DeepSeekError } from './deepseek_client.mjs';
import { parseSichosXml, validateParsed } from './parse_xml.mjs';
import { recoverExactChunk, conciseFailure } from './response_repair.mjs';
import { estimateCost } from './cost_estimate.mjs';
import { writeJson, writeText } from './save_output.mjs';
import { chunkDocument } from './corpus_utils.mjs';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const chunkDir = (documentDir, index) => path.join(documentDir, 'chunks', String(index).padStart(4, '0'));

function readValidatedChunk(dir, chunk) {
  const response = path.join(dir, 'response.xml');
  const result = path.join(dir, 'result.json');
  if (!fs.existsSync(response) || !fs.existsSync(result)) return null;
  try {
    const parsed = parseSichosXml(fs.readFileSync(response, 'utf8'));
    return validateParsed(chunk, parsed).ok ? JSON.parse(fs.readFileSync(result, 'utf8')) : null;
  } catch { return null; }
}

function translationBody(xml) {
  const normalized = parseSichosXml(xml).xml;
  const match = normalized.match(/^<translation>\s*([\s\S]*?)\s*<\/translation>$/);
  if (!match) throw new Error('Unable to normalize translation chunk');
  return match[1].trim();
}

export function combineXml(parts) {
  return `<translation>\n${parts.map(translationBody).join('\n')}\n</translation>`;
}

function shouldRetry(error) {
  if (error instanceof DeepSeekError) return error.retryable && !error.fatal;
  return true;
}

function persistAttempt(dir, attempt, prompt, response, recovery, error) {
  const attemptDir = path.join(dir, 'attempts', String(attempt + 1).padStart(2, '0'));
  fs.mkdirSync(attemptDir, { recursive: true });
  writeText(path.join(attemptDir, 'prompt.txt'), prompt);
  if (response) {
    writeJson(path.join(attemptDir, 'request.json'), response.sanitizedRequest || {});
    writeJson(path.join(attemptDir, 'raw-response.json'), response.rawResponse || {});
    writeText(path.join(attemptDir, 'response.xml'), response.xml || '');
  }
  writeJson(path.join(attemptDir, 'outcome.json'), {
    ok: Boolean(recovery?.ok), method: recovery?.method || null,
    reason: recovery?.reason || null, errors: recovery?.errors || null,
    error: error ? conciseFailure(error, 30) : null,
    usage: response?.usage || null, at: new Date().toISOString()
  });
}

async function translateChunk(chunk, dir, options) {
  let feedback = '';
  let lastError;
  for (let attempt = 0; attempt <= options.retries; attempt++) {
    const prompt = buildPrompt(chunk, { retryFeedback: feedback });
    let response = null;
    try {
      response = await options.client({ prompt, model: options.model, signal: options.signal });
      const recovery = recoverExactChunk(chunk, response.xml);
      if (!recovery.ok) {
        const detail = recovery.errors?.join('\n') || recovery.error || recovery.reason;
        throw new Error(detail || 'Response failed validation');
      }
      persistAttempt(dir, attempt, prompt, response, recovery, null);
      return { response, ...recovery, attempt };
    } catch (error) {
      lastError = error;
      const recovery = response ? recoverExactChunk(chunk, response.xml) : null;
      persistAttempt(dir, attempt, prompt, response, recovery, error);
      feedback = conciseFailure(error);
      if (attempt === options.retries || !shouldRetry(error) || options.signal?.aborted) break;
      await sleep(options.retryBaseMs * (2 ** attempt));
    }
  }
  throw lastError;
}

export async function runDocument(document, options = {}) {
  const rootDir = options.rootDir;
  const model = options.model || 'deepseek-chat';
  const maxChars = options.maxChars || 12000;
  const retries = Number.isInteger(options.retries) ? options.retries : 3;
  const documentDir = path.join(rootDir, 'documents', document.documentId);
  fs.mkdirSync(documentDir, { recursive: true });
  writeJson(path.join(documentDir, 'source.json'), document);
  const chunks = chunkDocument(document, maxChars);
  const results = [];

  for (const chunk of chunks) {
    if (options.signal?.aborted) throw new DeepSeekError('Repair run aborted', { code: 'aborted' });
    const dir = chunkDir(documentDir, chunk.chunkIndex);
    fs.mkdirSync(dir, { recursive: true });
    writeJson(path.join(dir, 'source.json'), chunk);
    writeText(path.join(dir, 'prompt.txt'), buildPrompt(chunk));
    if (options.dryRun) { results.push({ chunkIndex: chunk.chunkIndex, dryRun: true }); continue; }
    const reused = !options.force ? readValidatedChunk(dir, chunk) : null;
    if (reused) { results.push({ ...reused, reused: true }); continue; }
    const translated = await translateChunk(chunk, dir, {
      model, retries, retryBaseMs: options.retryBaseMs ?? 1500,
      client: options.client || callDeepSeek, signal: options.signal
    });
    writeJson(path.join(dir, 'request.json'), translated.response.sanitizedRequest || { model });
    writeJson(path.join(dir, 'raw-response.json'), translated.response.rawResponse || {});
    writeText(path.join(dir, 'response.xml'), translated.xml.trim());
    const result = { chunkIndex: chunk.chunkIndex, validation: translated.validation,
      usage: translated.response.usage, cost: estimateCost(translated.response.usage),
      attempts: translated.attempt + 1, recoveryMethod: translated.method };
    writeJson(path.join(dir, 'parsed.json'), translated.parsed);
    writeJson(path.join(dir, 'validation.json'), translated.validation);
    writeJson(path.join(dir, 'result.json'), result);
    results.push(result);
  }

  if (!options.dryRun) {
    const parts = chunks.map(chunk => fs.readFileSync(path.join(chunkDir(documentDir, chunk.chunkIndex), 'response.xml'), 'utf8'));
    const xml = combineXml(parts);
    const parsed = parseSichosXml(xml);
    const validation = validateParsed(document, parsed, { throwOnError: true });
    writeText(path.join(documentDir, 'translation.xml'), xml);
    writeJson(path.join(documentDir, 'translation.parsed.json'), parsed);
    writeJson(path.join(documentDir, 'translation.validation.json'), validation);
  }
  const summary = { documentId: document.documentId, title: document.title, chunks: chunks.length, dryRun: Boolean(options.dryRun), results };
  writeJson(path.join(documentDir, 'summary.json'), summary);
  return summary;
}
