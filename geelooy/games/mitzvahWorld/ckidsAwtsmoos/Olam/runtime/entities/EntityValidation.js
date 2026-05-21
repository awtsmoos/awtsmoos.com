/**
 * B"H
 * @file EntityValidation.js
 *
 * Chapter 21: The Name That Refused To Be A Coordinate.
 *
 * The Awtsmoos lets every created thing stand by its true runtime identity,
 * not by a brittle x,y rumor or painted glyph. This module is the gatekeeper:
 * tiny, pure, severe, and merciful. It rejects missing uu values before the
 * world can mistake scenery for soul.
 */

/**
 * Ensures a value is a non-empty runtime id.
 * @param {string} value The proposed identity string.
 * @param {string} label Human-readable field name for errors.
 * @returns {string} The trimmed identity.
 */
export function requireEntityId(value, label = 'uu') {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`Entity ${label} is required.`);
  return text;
}

/**
 * Throws if an entity record lacks the minimum covenant of identity.
 * @param {object} record Candidate runtime record.
 * @returns {object} The same record after validation.
 */
export function assertEntityRecord(record) {
  if (!record || typeof record !== 'object') throw new Error('Entity record must be an object.');
  requireEntityId(record.uu, 'uu');
  requireEntityId(record.id ?? record.uu, 'id');
  requireEntityId(record.type ?? 'entity', 'type');
  return record;
}

/**
 * Verifies a uu is not already present in a Map-like registry.
 * @param {Map<string, object>} records Existing records by uu.
 * @param {string} uu Proposed unique id.
 * @returns {string} The same uu when unique.
 */
export function assertUniqueEntity(records, uu) {
  if (records.has(uu)) throw new Error(`Duplicate entity uu: ${uu}`);
  return uu;
}
