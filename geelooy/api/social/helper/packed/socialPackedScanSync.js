//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked synchronous JSONL scans and latest-per-key builders (split from socialPacked.js).
 */
const fs = require('fs');
const { StringDecoder } = require('string_decoder');
const { fileFor } = require('./socialPackedEngine.js');
function readLines(file) {
  if (!file || !fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\n+/).filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}
/**
 * B"H 2026-10-11: sync chunked JSONL scan — O(1) memory, no 2 GiB limit.
 * readLines() used fs.readFileSync, which throws ERR_FS_FILE_TOO_LARGE on
 * the production core shard (3.9 GB) — that single throw 500'd every packed
 * read route AND silently emptied buildLiveHashCache (dry-run "wrote" 1011).
 * This scans in 4 MB chunks with a StringDecoder so multi-byte Hebrew is
 * never split mid-character; callers stay synchronous.
 */
function forEachFileRecord(root, shard, onRecord) {
  const file = fileFor(root, shard);
  if (!file || !fs.existsSync(file)) return;
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const CHUNK = 4 * 1024 * 1024;
    const buf = Buffer.allocUnsafe(CHUNK);
    const decoder = new StringDecoder('utf8');
    let leftover = '';
    let pos = 0;
    const handleLine = (line) => {
      if (!line) return;
      let rec;
      try { rec = JSON.parse(line); } catch (_) { return; }
      if (rec && rec.key) onRecord(rec);
    };
    while (pos < size) {
      const n = fs.readSync(fd, buf, 0, Math.min(CHUNK, size - pos), pos);
      if (n <= 0) break;
      pos += n;
      const text = leftover + decoder.write(buf.subarray(0, n));
      const lines = text.split('\n');
      leftover = lines.pop();
      for (const line of lines) handleLine(line);
    }
    handleLine(leftover + decoder.end());
  } finally {
    fs.closeSync(fd);
  }
}
function latestFileRecords(root, shard) {
  const latest = new Map();
  forEachFileRecord(root, shard, (record) => latest.set(record.key, record));
  return [...latest.values()];
}
/**
 * B"H 2026-10-20 (flap-fix): builds the latest-per-key Map directly so the
 * records cache can retain it and merge appends incrementally (see
 * listPackedRecords) instead of re-parsing the whole shard per change.
 */
function latestFileRecordsMap(root, shard) {
  const latest = new Map();
  forEachFileRecord(root, shard, (record) => latest.set(record.key, record));
  return latest;
}
module.exports = { readLines, forEachFileRecord, latestFileRecords, latestFileRecordsMap };
