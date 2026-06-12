// B"H
/**
 * @file legacy.js
 * @chapter The Old Tree Became Readable Memory
 * @description
 * Read-only fallback for pre-v3 `__fs__` nested virtual filesystem data. New
 * writes never go here, but existing DBs continue to read until migrated.
 */

const { LEGACY_KEY } = require("./schema");
const paths = require("./path");

function legacyRoot(db) {
  return db.root[LEGACY_KEY] || {};
}

function plain(value) {
  return value && value.__resolve__ ? value.__resolve__() : value;
}

function legacyNode(db, p) {
  const parts = paths.split(p);
  let cur = legacyRoot(db);
  for (const part of parts) {
    if (!cur || cur[part] === undefined) return undefined;
    cur = cur[part];
  }
  return plain(cur);
}

function legacyLs(db, p) {
  const node = legacyNode(db, p);
  if (!node || typeof node !== "object" || node.__awtsmoosBlob) return [];
  return Object.keys(node).sort();
}

function legacyCat(db, p, options = {}) {
  const node = legacyNode(db, p);
  if (node && node.__awtsmoosBlob) return db.blob.read(node, options.offset || 0, options.length);
  return node;
}

function legacyExists(db, p) {
  return legacyNode(db, p) !== undefined;
}

module.exports = { legacyNode, legacyLs, legacyCat, legacyExists };
