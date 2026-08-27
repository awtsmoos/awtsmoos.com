// B"H
/**
 * Chapter 521: The gate of thought is gentle, but it still has walls.
 * Every incoming spark is washed before it enters the palace.
 */
function cleanText(value, max = 600) {
  return String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
}

function cleanId(value, fallback = '') {
  return cleanText(value, 180).replace(/[^a-zA-Z0-9_:@.-]/g, '_') || fallback;
}

function cleanLimit(value, fallback = 80, max = 250) {
  const number = Number(value || fallback);
  if (!Number.isFinite(number) || number < 1) return fallback;
  return Math.min(Math.floor(number), max);
}

function parseJson(value) {
  if (value && typeof value === 'object') return value;
  if (!value || typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeInput(input = {}, entityType = '', entityId = '') {
  const aliasId = cleanId(input.aliasId || input.authorAliasId || input.actorAliasId || 'anonymous', 'anonymous');
  return {
    entityType: cleanId(entityType || input.entityType || 'page', 'page'),
    entityId: cleanId(entityId || input.entityId || input.postId || 'root', 'root'),
    aliasId,
    heichelId: cleanId(input.heichelId || '', ''),
    seriesId: cleanId(input.seriesId || '', ''),
    postId: cleanId(input.postId || '', ''),
    body: cleanText(input.body || input.text || input.content || '', 2000),
    context: parseJson(input.context)
  };
}

function thoughtId(prefix = 'thought') {
  return `BH_${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

module.exports = { cleanText, cleanId, cleanLimit, parseJson, normalizeInput, thoughtId };
