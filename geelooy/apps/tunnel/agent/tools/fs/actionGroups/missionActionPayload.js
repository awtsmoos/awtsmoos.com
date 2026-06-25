// B"H

/**
 * B"H
 * Chapter 542: The payload came wearing many coats.
 * The Awtsmoos in the code reveals one nefesh behind params, JSON strings,
 * direct fields, console output, and human-written proof details. This module
 * makes mission actions remember the same truth no matter which coat arrived.
 */
function parsedParams(params) {
  if (!params) return {};
  if (typeof params === 'object' && !Array.isArray(params)) return params;
  if (typeof params !== 'string') return {};
  try {
    const parsed = JSON.parse(params);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function mergedPayload(payload = {}) {
  const decoded = parsedParams(payload.params);
  return { ...decoded, ...payload };
}

function firstPresent(input, keys) {
  for (const key of keys) {
    const value = input?.[key];
    if (value !== undefined && value !== null && String(value) !== '') return value;
  }
  return null;
}

function normalizeStartPayload(input = {}) {
  const metadata = input.metadata && typeof input.metadata === 'object' ? input.metadata : {};
  const projectRoot = firstPresent(input, ['projectRoot', 'root', 'directory', 'cwd']) || metadata.projectRoot || '';
  return {
    ...input,
    goal: firstPresent(input, ['goal', 'prompt', 'query', 'q', 'text']) || 'Untitled mission',
    definitionOfDone: input.definitionOfDone || input.criteria || input.dod || input.done || undefined,
    metadata: { ...metadata, projectRoot }
  };
}

function normalizeEvidencePayload(input = {}) {
  const proof = firstPresent(input, [
    'proof',
    'observedProof',
    'details',
    'detail',
    'output',
    'stdout',
    'stderr',
    'result',
    'data',
    'body'
  ]);
  const claim = firstPresent(input, ['claim', 'message', 'text', 'query', 'title', 'summary']) || '';
  return {
    ...input,
    kind: input.kind || input.type || 'note',
    claim: String(claim),
    proof,
    ok: input.ok === undefined ? true : input.ok
  };
}

module.exports = {
  parsedParams,
  mergedPayload,
  normalizeStartPayload,
  normalizeEvidencePayload
};
