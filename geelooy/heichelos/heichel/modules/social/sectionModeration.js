//B"H
import { normalizeTarget } from './targets.js';

export function createModerationMarker({ target, reason = '', severity = 'review', actor = '' } = {}) {
  return {
    target: normalizeTarget(target),
    reason: String(reason || ''),
    severity,
    actor,
    createdAt: Date.now()
  };
}

export function markerTouchesSection(marker = {}, sectionId = '') {
  return marker.target?.sectionId === sectionId;
}
