/**
 * B"H
 * @file CapabilityQueries.js
 *
 * Chapter 26: The Map Of Powers Opened In Silence.
 *
 * Query helpers keep higher systems clean. They ask the registry for readable
 * books, quest givers, debate masters, and collectable sparks without knowing
 * who wears a hat, a bark texture, or a glowing marker.
 */

/**
 * Returns all records with a capability.
 * @param {object} entityRegistry Registry exposing findByCapability.
 * @param {string} capability Capability key.
 * @returns {object[]} Matching runtime records.
 */
export function entitiesWithCapability(entityRegistry, capability) {
  return entityRegistry?.findByCapability?.(capability) || [];
}

/**
 * Tests one record for a capability.
 * @param {object} record Runtime entity record.
 * @param {string} capability Capability key.
 * @returns {boolean} True when enabled.
 */
export function hasCapability(record, capability) {
  return Boolean(record?.capabilities?.[capability]);
}

/**
 * Builds a compact capability summary for diagnostics and HUD filters.
 * @param {object[]} records Runtime entity records.
 * @returns {object} Count by capability.
 */
export function summarizeCapabilities(records = []) {
  return records.reduce((summary, record) => {
    Object.entries(record.capabilities || {}).forEach(([key, enabled]) => {
      if (enabled) summary[key] = (summary[key] || 0) + 1;
    });
    return summary;
  }, {});
}
