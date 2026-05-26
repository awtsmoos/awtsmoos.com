//B"H
import { EDGE_TYPES } from './edgeTypes.js';
import { normalizeTarget } from './targets.js';

export function createQuoteLink({ source, target, text = '' } = {}) {
  return {
    edgeType: EDGE_TYPES.QUOTES,
    source: normalizeTarget(source),
    target: normalizeTarget(target),
    text: String(text || '').trim(),
    createdAt: Date.now()
  };
}
