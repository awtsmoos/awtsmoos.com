/**
 * B"H
 * @module ContentNormalizer
 * @description
 * In the hush before the UI opens its eyes, the Awtsmoos speaks every
 * endpoint-dialect into one steady vessel. Old readers may send maps,
 * new readers may send wrapped success arrays, and repaired shards may
 * carry their sparks inside record/prateem chambers. This module gathers
 * those scattered letters, trims the smoke, and returns living records
 * the renderer can trust.
 */

/**
 * B"H
 * @function normalizeCollection
 * @description
 * Converts every supported API list shape into a flat array of record
 * objects. The function is intentionally forgiving because the heichel UI
 * must walk backward-compatible roads without turning a server wrapper
 * into a fake "Hidden Insight" card.
 * @param {*} value - Any response returned by an old or new API reader.
 * @returns {Array<Object>} A clean list of object records, preserving ids
 * when object-map keys are the only stable identity available.
 */
export function normalizeCollection(value) {
    const opened = openResponseVessel(value);
    const list = Array.isArray(opened)
        ? opened
        : opened && typeof opened === 'object'
            ? Object.entries(opened).map(([key, entry]) => withMapKey(entry, key))
            : [];

    return list
        .map(openRecordVessel)
        .filter(record => record && typeof record === 'object');
}

/**
 * B"H
 * @function openResponseVessel
 * @description
 * Peels common transport wrappers while leaving genuine records intact.
 * @param {*} value - The raw response or nested response wrapper.
 * @returns {*} The first list-like or map-like payload discovered.
 */
export function openResponseVessel(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return value;

    const candidateKeys = ['success', 'items', 'records', 'data', 'result'];
    for (const key of candidateKeys) {
        const child = value[key];
        if (Array.isArray(child)) return child;
        if (child && typeof child === 'object' && isCollectionMap(child)) return child;
    }

    return value;
}

/**
 * B"H
 * @function openRecordVessel
 * @description
 * Reveals the usable content object from nested record/prateem shells.
 * @param {*} item - A single possible item from the collection.
 * @returns {Object|null} A normalized record or null when no record exists.
 */
export function openRecordVessel(item) {
    if (!item || typeof item !== 'object') return null;
    const candidates = [item, item.prateem, item.record, item.details, item.data];
    const opened = candidates.find(candidate => candidate && typeof candidate === 'object');
    if (!opened) return item;
    return { ...opened, ...identityFields(item) };
}

/**
 * B"H
 * @function identityFields
 * @description
 * Carries identity fields from wrappers into the opened record so clicks,
 * comments, references, and shares point to the real post or series.
 * @param {Object} item - The original wrapper object.
 * @returns {Object} The stable identity fragments found on the wrapper.
 */
function identityFields(item) {
    const fields = {};
    ['id', 'postId', 'seriesId', 'inputId', 'indexInSeries', 'parentSeriesId'].forEach(key => {
        if (item[key] !== undefined) fields[key] = item[key];
    });
    return fields;
}

/**
 * B"H
 * @function withMapKey
 * @description
 * Uses an object-map key as the id when the nested value forgot its name.
 * @param {*} entry - The map value.
 * @param {string} key - The map key.
 * @returns {*} The value enriched with a fallback id when possible.
 */
function withMapKey(entry, key) {
    if (!entry || typeof entry !== 'object') return entry;
    if (entry.id || entry.postId || entry.seriesId || entry.inputId) return entry;
    return { ...entry, id: key };
}

/**
 * B"H
 * @function isCollectionMap
 * @description
 * Distinguishes a response map from a single content record.
 * @param {Object} value - A possible object map.
 * @returns {boolean} True when the object appears to hold records.
 */
function isCollectionMap(value) {
    const entries = Object.values(value);
    return entries.length > 0 && entries.every(entry => entry && typeof entry === 'object');
}
