// B"H
const path = require('path');
const { read, sourceMark } = require('../dbPool.js');
const { normalize, flatten } = require('../normalizer.js');
const { resolvePost, alignment } = require('../postResolver.js');
const { resolve: resolveMeluket } = require('../meluketMap.js');
const ALIASES = ['meluket_translation_en', 'awtsmoosTranslations', 'awtsmoos'];
function candidates(base, aliasId) { return [`${base}/${aliasId}`, `${base}/${aliasId}.awtsmoosJSON`]; }
function sourceCoordinates($i, seriesId, postId) {
  const mapped = resolveMeluket($i, seriesId, postId);
  return mapped ? { seriesId:mapped.oldSeriesId, postId:mapped.oldPostId, mapped } : { seriesId, postId, mapped:null };
}
async function load({ $i, family, heichelId, seriesId, postId }) {
  const post = await resolvePost($i, heichelId, seriesId, postId);
  if (!post) return { rows: [], warnings: [{ code:'MISSING_ACTIVE_POST', family:family.id, seriesId, postId }] };
  const file = path.join($i.db.directory, 'socialPacked', `social.heichel.${heichelId}.comments.fs.awtsdb`);
  const source = sourceCoordinates($i, seriesId, postId);
  const base = `/social/heichelos/${heichelId}/comments/atSeries/${source.seriesId}/atPost/${source.postId}`;
  const rows = [], warnings = [], sources = {};
  for (const aliasId of ALIASES) {
    let payload = null, sourcePath = '';
    for (const candidate of candidates(base, aliasId)) { payload = read(file, candidate); if (payload) { sourcePath = candidate; break; } }
    if (!payload) continue;
    let rejected = 0;
    const data = flatten(payload);
    data.forEach((row, index) => {
      const status = alignment(row, post);
      if (status.status === 'out-of-bounds') { rejected++; return; }
      rows.push(normalize({ row, source:family.id, aliasId, seriesId, postId, heichelId, index, sourcePath, sourceFile:file, alignment:status }));
    });
    sources[aliasId] = { count:data.length-rejected, rejected, fingerprint:sourceMark(file), mappedFrom:source.mapped || undefined };
    if (rejected) warnings.push({ code:'OUT_OF_BOUNDS_ROWS', source:aliasId, count:rejected });
  }
  if (!rows.length) warnings.push({ code:'MELUKET_RECORD_NOT_FOUND', seriesId, postId, mappedFrom:source.mapped || undefined });
  return { rows, warnings, sources };
}
module.exports = { load, sourceCoordinates };
