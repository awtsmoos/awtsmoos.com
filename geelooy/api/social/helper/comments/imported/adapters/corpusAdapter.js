// B"H
const path = require('path');
const { read, sourceMark } = require('../dbPool.js');
const { normalize, flatten } = require('../normalizer.js');
const { resolvePost, alignment } = require('../postResolver.js');
async function load({ $i, family, heichelId, seriesId, postId }) {
  const post = await resolvePost($i, heichelId, seriesId, postId);
  if (!post) return { rows: [], warnings: [{ code: 'MISSING_ACTIVE_POST', family: family.id, seriesId, postId }] };
  const rows = [], warnings = [];
  const sources = {};
  // Primary alias + any extra aliases (e.g. Rashi alongside the main translation).
  // Each alias reads its own corpus file; rows are tagged with their aliasId so
  // consumers can filter (translations API keeps the primary alias only).
  const specs = [{ alias: family.alias, file: family.file }, ...((family.extraAliases || []).map(a => ({ alias: a.alias, file: a.file })))];
  for (const spec of specs) {
    if (!spec.alias || !spec.file) continue;
    const file = path.join($i.db.directory, 'socialPacked', spec.file);
    const virtualPath = `/social/heichelos/${heichelId}/comments/atSeries/${seriesId}/atPost/${postId}/${spec.alias}`;
    const payload = read(file, virtualPath);
    if (!payload) { warnings.push({ code: 'CORPUS_RECORD_NOT_FOUND', family: family.id, seriesId, postId, alias: spec.alias }); continue; }
    let rejected = 0, weak = 0, accepted = 0;
    flatten(payload).forEach((row, index) => {
      const status = alignment(row, post);
      if (status.status === 'out-of-bounds') { rejected++; return; }
      if (status.status === 'weak' || status.status === 'unverified') weak++;
      rows.push(normalize({ row, source: family.id, aliasId: spec.alias, seriesId, postId, heichelId, index, sourcePath: virtualPath, sourceFile: file, alignment: status }));
      accepted++;
    });
    if (rejected) warnings.push({ code: 'OUT_OF_BOUNDS_ROWS', family: family.id, count: rejected, alias: spec.alias });
    if (weak) warnings.push({ code: 'WEAK_OR_UNVERIFIED_ALIGNMENT', family: family.id, count: weak, alias: spec.alias });
    sources[spec.alias] = { count: accepted, rejected, fingerprint: sourceMark(file) };
  }
  return { rows, warnings, sources };
}
module.exports = { load };
