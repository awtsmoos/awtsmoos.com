// B"H
const fs = require('fs');
const path = require('path');
let cached = null;
let cachedFile = '';
let cachedMark = '';
function mapFile($i) {
  return path.join($i.db.directory, 'socialPacked', 'meluket-post-map.v1.json');
}
function load($i) {
  const file = mapFile($i);
  const stat = fs.statSync(file);
  const mark = `${stat.size}:${Math.floor(stat.mtimeMs)}`;
  if (cached && cachedFile === file && cachedMark === mark) return cached;
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (parsed.version !== 1 || parsed.count !== Object.keys(parsed.entries || {}).length) {
    throw new Error('Invalid Meluket mapping file.');
  }
  cached = parsed.entries;
  cachedFile = file;
  cachedMark = mark;
  return cached;
}
function resolve($i, seriesId, postId) {
  try { return load($i)[`${seriesId}\0${postId}`] || null; }
  catch { return null; }
}
module.exports = { resolve, mapFile };
