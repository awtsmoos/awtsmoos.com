// B"H
const path = require('path');
const { read, sourceMark } = require('../dbPool.js');
const { normalize } = require('../normalizer.js');
const { normalized } = require('../text.js');
const { resolvePost, alignment } = require('../postResolver.js');
function part(value) { return encodeURIComponent(String(value)).replace(/%/g, '~'); }
function verseKey(row) { return String(row?.verseSection ?? row?.dayuh?.verseSection ?? 'root'); }
function unique(rows, onePerVerse = false) {
  if (onePerVerse) {
    const latest = new Map();
    for (const row of rows || []) latest.set(verseKey(row), row);
    return [...latest.values()].sort((a, b) => Number(verseKey(a)) - Number(verseKey(b)));
  }
  const seen = new Set(), out = [];
  for (const row of rows || []) {
    const content = row?.content || row?.comment?.content || '';
    const key = [verseKey(row), row?.subsectionId || '', normalized(content)].join('\0');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}
async function load({ $i, family, heichelId, seriesId, postId }) {
  const post = await resolvePost($i, heichelId, seriesId, postId);
  if (!post) return { rows: [], warnings: [{ code: 'MISSING_ACTIVE_POST', family: family.id, seriesId, postId }] };
  const root = path.join($i.db.directory, 'socialPacked', 'commentShards', family.id);
  const virtualPath = `/bySeries/${part(seriesId)}/byPost/${part(postId)}/comments.awtsmoosJSON`;
  const rows = [], warnings = [], sources = {};
  for (const aliasId of family.aliases) {
    const file = path.join(root, `${aliasId}.comments.fs.awtsdb`);
    const payload = read(file, virtualPath);
    if (!Array.isArray(payload)) continue;
    const data = unique(payload, aliasId === 'torah_translation_en');
    let accepted = 0, rejected = 0;
    data.forEach((row, index) => {
      const status = alignment(row, post);
      if (status.status === 'out-of-bounds') { rejected++; return; }
      rows.push(normalize({ row, source: family.id, aliasId, seriesId, postId, heichelId, index, sourcePath: virtualPath, sourceFile: file, alignment: status }));
      accepted++;
    });
    sources[aliasId] = { count: accepted, rejected, duplicates: payload.length - data.length, fingerprint: sourceMark(file) };
    if (rejected) warnings.push({ code: 'OUT_OF_BOUNDS_ROWS', source: aliasId, count: rejected });
  }
  if (!rows.length) warnings.push({ code: 'SHARD_RECORD_NOT_FOUND', family: family.id, seriesId, postId });
  return { rows, warnings, sources };
}
module.exports = { load, unique };
