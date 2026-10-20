//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked tail merge and async file-record scans (split from socialPacked.js).
 */
const fs = require('fs');
const { fileFor } = require('./socialPackedEngine.js');
/**
 * B"H 2026-10-20 (flap-fix): merges ONLY the appended tail bytes [from, to)
 * of an append-only JSONL shard into an existing latest-per-key Map.
 * Splitting on the raw 0x0A byte is UTF-8 safe (0x0A never appears inside
 * a multi-byte sequence). Returns the offset just past the last complete
 * newline merged, so a partial line caught mid-append is re-read on the
 * next merge instead of being consumed half-parsed.
 */
function mergeShardTail(latest, file, from, to) {
  const fd = fs.openSync(file, 'r');
  try {
    const CHUNK = 4 * 1024 * 1024;
    let pos = from;
    let pending = Buffer.alloc(0);
    while (pos < to) {
      const want = Math.min(CHUNK, to - pos);
      const buf = Buffer.allocUnsafe(want);
      const n = fs.readSync(fd, buf, 0, want, pos);
      if (n <= 0) break;
      pos += n;
      pending = pending.length ? Buffer.concat([pending, buf.subarray(0, n)]) : buf.subarray(0, n);
      const cut = pending.lastIndexOf(0x0a);
      if (cut < 0) continue;
      const complete = pending.subarray(0, cut + 1).toString('utf8');
      pending = pending.subarray(cut + 1);
      for (const line of complete.split('\n')) {
        if (!line) continue;
        let rec;
        try { rec = JSON.parse(line); } catch { continue; }
        if (rec && rec.key) latest.set(rec.key, rec);
      }
    }
    return pos - pending.length;
  } finally {
    fs.closeSync(fd);
  }
}
async function latestFileRecordsAsync(root, shard) {
  const latest = new Map();
  await forEachFileRecordAsync(root, shard, (record) => latest.set(record.key, record));
  return [...latest.values()];
}
/**
 * Async forward scan that never accumulates: the callback decides what to
 * retain. (latestFileRecordsAsync above retains everything — do NOT use it
 * on multi-GB shards; it OOMs. It is kept only for small-shard callers.)
 */
function forEachFileRecordAsync(root, shard, onRecord) {
  return new Promise((resolve) => {
    const file = fileFor(root, shard);
    if (!file || !fs.existsSync(file)) return resolve();
    const rl = require('readline').createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
    rl.on('line', (line) => {
      if (!line) return;
      let rec;
      try { rec = JSON.parse(line); } catch (_) { return; }
      if (rec && rec.key) {
        try { onRecord(rec); } catch (_) { /* ignore */ }
      }
    });
    rl.on('close', () => resolve());
    rl.on('error', () => resolve());
  });
}
module.exports = { mergeShardTail, latestFileRecordsAsync, forEachFileRecordAsync };
