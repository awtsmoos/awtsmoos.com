//B"H
/**
 * @module recordEnvelope
 * @description
 * Explicit packed record types for future AwtsmoosDB shards. Busy JSON keeps
 * a whole nested dayuh/body object together as one payload, so deep arrays do
 * not explode into thousands of child filesystem records.
 */

const RECORD_TYPES = {
  jsonObject: 'jsonObject',
  jsonBusyObject: 'jsonBusyObject',
  graphEdge: 'graphEdge',
  notification: 'notification',
  migrationManifest: 'migrationManifest',
  tombstone: 'tombstone'
};

function estimateComplexity(value) {
  let nodes = 0;
  let arrays = 0;
  let maxDepth = 0;
  const seen = new Set();

  function walk(node, depth) {
    if (node === null || typeof node !== 'object') return;
    if (seen.has(node)) return;
    seen.add(node);
    nodes++;
    if (Array.isArray(node)) arrays++;
    if (depth > maxDepth) maxDepth = depth;
    for (const child of Object.values(node)) walk(child, depth + 1);
  }

  walk(value, 0);
  return { nodes, arrays, maxDepth };
}

function chooseJsonRecordType(value) {
  const complexity = estimateComplexity(value);
  const busy = complexity.nodes >= 8 || complexity.arrays >= 2 || complexity.maxDepth >= 4;
  return busy ? RECORD_TYPES.jsonBusyObject : RECORD_TYPES.jsonObject;
}

function makeEnvelope({ type, key, value, meta = {}, op = 'put' }) {
  return {
    op,
    key,
    recordType: type || chooseJsonRecordType(value),
    value,
    meta: {
      ...meta,
      complexity: estimateComplexity(value)
    },
    schemaVersion: 1,
    ts: Date.now()
  };
}

module.exports = {
  RECORD_TYPES,
  estimateComplexity,
  chooseJsonRecordType,
  makeEnvelope
};
