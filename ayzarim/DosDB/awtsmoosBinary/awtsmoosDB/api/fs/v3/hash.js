// B"H
/**
 * @file hash.js
 * @chapter A Name Became A Single Gate
 * @description
 * Stable non-cryptographic keys for filesystem indexes. These are deterministic
 * labels, not security hashes. The full normalized path is also stored in inode
 * metadata, so a collision can be detected and repaired in future versions.
 */

function hashString(value) {
  const text = String(value || "");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(36);
}

function pathKey(path) {
  return `p:${hashString(path)}:${path.length}`;
}

function childKey(parentInode, childName) {
  return `c:${parentInode}:${childName}`;
}

module.exports = { hashString, pathKey, childKey };
