// B"H
const path = require('path');
const { read, sourceMark } = require('../dbPool.js');
const { normalize, flatten } = require('../normalizer.js');
const { resolvePost, alignment } = require('../postResolver.js');
async function load({ $i, family, heichelId, seriesId, postId }) {
  const post = await resolvePost($i, heichelId, seriesId, postId);
  if (!post) return { rows: [], warnings: [{ code: 'MISSING_ACTIVE_POST', family: family.id, seriesId, postId }] };
  const file = path.join($i.db.directory, 'socialPacked', family.file);
  const virtualPath = `/social/heichelos/${heichelId}/comments/atSeries/${seriesId}/atPost/${postId}/${family.alias}`;
  const payload = read(file, virtualPath);
  if (!payload) return { rows: [], warnings: [{ code: 'CORPUS_RECORD_NOT_FOUND', family: family.id, seriesId, postId }] };
  const rows = [], warnings = [];
  let rejected = 0, weak = 0;
  flatten(payload).forEach((row, index) => {
    const status = alignment(row, post);
    if (status.status === 'out-of-bounds') { rejected++; return; }
    if (status.status === 'weak' || status.status === 'unverified') weak++;
    rows.push(normalize({ row, source: family.id, aliasId: family.alias, seriesId, postId, heichelId, index, sourcePath: virtualPath, sourceFile: file, alignment: status }));
  });
  if (rejected) warnings.push({ code: 'OUT_OF_BOUNDS_ROWS', family: family.id, count: rejected });
  if (weak) warnings.push({ code: 'WEAK_OR_UNVERIFIED_ALIGNMENT', family: family.id, count: weak });
  return { rows, warnings, sources: { [family.alias]: { count: rows.length, rejected, fingerprint: sourceMark(file) } } };
}
module.exports = { load };
