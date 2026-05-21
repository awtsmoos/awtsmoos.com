/**
 * B"H
 * @file EntityRuntimeRecord.js
 *
 * Chapter 22: The Vessel Received Its Systems.
 *
 * A mesh may flicker, a skin may change, a glyph may be replaced by moonlit
 * pixels, but the runtime record remains the named vessel. This factory keeps
 * that vessel plain data: fast to save, easy to test, impossible to confuse
 * with rendering paint.
 */

import { assertEntityRecord, requireEntityId } from './EntityValidation.js';

/**
 * Creates a normalized entity runtime record.
 * @param {object} input Runtime entity seed.
 * @param {string} input.uu Stable unique runtime id.
 * @param {string} [input.id] Design id, defaults to uu.
 * @param {string} [input.type] Runtime kind, defaults to entity.
 * @param {object} [input.mesh] Optional scene object binding.
 * @param {object} [input.systems] Declarative systems map.
 * @param {object} [input.state] Mutable save-safe state.
 * @param {object} [input.capabilities] Queryable capability map.
 * @returns {object} Normalized runtime record.
 */
export function createEntityRuntimeRecord(input = {}) {
  const uu = requireEntityId(input.uu ?? input.userData?.uu ?? input.name, 'uu');
  const record = {
    uu,
    id: String(input.id ?? input.userData?.id ?? uu),
    type: String(input.type ?? input.userData?.type ?? 'entity'),
    mesh: input.mesh ?? null,
    systems: { ...(input.systems || {}) },
    state: { ...(input.state || {}) },
    capabilities: { ...(input.capabilities || {}) },
    memory: { ...(input.memory || {}) }
  };

  return assertEntityRecord(record);
}

/**
 * Creates a record from a Three-like scene object without importing Three.
 * @param {object} mesh Scene object with name/userData.
 * @returns {object} Runtime record bound to that mesh.
 */
export function createEntityRecordFromMesh(mesh) {
  return createEntityRuntimeRecord({
    uu: mesh?.userData?.uu ?? mesh?.userData?.npcId ?? mesh?.name,
    id: mesh?.userData?.id ?? mesh?.userData?.npcId ?? mesh?.name,
    type: mesh?.userData?.type ?? mesh?.userData?.entityType ?? 'sceneObject',
    capabilities: mesh?.userData?.capabilities || {},
    systems: mesh?.userData?.systems || {},
    state: mesh?.userData?.state || {},
    mesh
  });
}
