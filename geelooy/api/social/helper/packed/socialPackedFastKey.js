//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked fast key/type extraction without JSON.parse (split from socialPacked.js).
 */
/**
 * Fast {key, op, recordType} extraction without JSON.parse — the stats scan
 * touches every line of multi-GB shards, and full parsing is ~90 MB/s
 * (3.9 GB ≈ 43 s, past nginx's timeout). Targeted string extraction runs
 * at ~500 MB/s+. Falls back to null (caller then JSON.parses the line).
 * Field order follows makeEnvelope(): op, key, recordType, value, ...
 */
function fastKeyType(line) {
  try {
    const vi = line.indexOf('"value":');
    let ki = line.indexOf('"key":"');
    if (ki < 0 || (vi >= 0 && ki > vi)) return null;
    ki += 7;
    let ke = ki;
    while (ke < line.length) {
      const c = line[ke];
      if (c === '\\') { ke += 2; continue; }
      if (c === '"') break;
      ke++;
    }
    if (ke >= line.length) return null;
    const key = line.slice(ki, ke);
    if (!key) return null;
    let op = 'put';
    const oi = line.indexOf('"op":"');
    if (oi >= 0 && oi < ki) {
      const oe = line.indexOf('"', oi + 6);
      if (oe > oi + 6) op = line.slice(oi + 6, oe);
    }
    let type = 'unknown';
    const ti = line.indexOf('"recordType":"');
    if (ti >= 0 && ti < ki + 200) {
      const te = line.indexOf('"', ti + 14);
      if (te > ti + 14) type = line.slice(ti + 14, te);
    }
    return { key, op, type };
  } catch (_) { return null; }
}
module.exports = { fastKeyType };
