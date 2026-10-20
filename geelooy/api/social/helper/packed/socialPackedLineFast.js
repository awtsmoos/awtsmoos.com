//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked fast forward raw-line async scan (split from socialPacked.js).
 */
const fs = require('fs');
const { fileFor } = require('./socialPackedEngine.js');
/**
 * Fast forward raw-line scan: chunked reading (no readline overhead) with a
 * setImmediate yield per chunk so the event loop stays responsive on
 * multi-GB shards. Byte-level 0x0A splitting is UTF-8 safe.
 * Lines are located with indexOf (V8's split() on multi-MB strings with
 * 300 KB lines is ~60 MB/s); only each line's head is materialized, since
 * the packed envelope's op/key/recordType always lead the line.
 */
function forEachLineFastAsync(root, shard, onLine) {
  return new Promise((resolve) => {
    const file = fileFor(root, shard);
    if (!file || !fs.existsSync(file)) return resolve();
    const CHUNK = 4 * 1024 * 1024;
    const HEAD = 512;
    let fh = null;
    (async () => {
      try { fh = await fs.promises.open(file, 'r'); }
      catch (_) { return resolve(); }
      const buf = Buffer.allocUnsafe(CHUNK);
      try {
        const size = (await fh.stat()).size;
        let pos = 0;
        let carry = Buffer.alloc(0); // partial-line bytes from previous chunk
        let stopped = false;
        while (pos < size && !stopped) {
          const n = Math.min(CHUNK, size - pos);
          const { bytesRead } = await fh.read(buf, 0, n, pos);
          if (bytesRead <= 0) break;
          pos += bytesRead;
          const chunk = buf.subarray(0, bytesRead);
          let lineStart = 0;
          let carryConsumed = false;
          for (;;) {
            const nl = chunk.indexOf(0x0A, lineStart);
            if (nl < 0) break;
            let head, getFull;
            if (carry.length && !carryConsumed) {
              // Line spans the chunk boundary: head = first 512 bytes of carry+segment.
              const need = Math.max(0, HEAD - carry.length);
              head = (need > 0
                ? Buffer.concat([carry, chunk.subarray(0, Math.min(nl, need))])
                : carry.subarray(0, HEAD)).toString('utf8');
              const c0 = carry, s1 = lineStart, e1 = nl;
              getFull = () => Buffer.concat([c0, chunk.subarray(s1, e1)]).toString('utf8');
              carryConsumed = true;
            } else {
              head = chunk.subarray(lineStart, Math.min(nl, lineStart + HEAD)).toString('utf8');
              const s1 = lineStart, e1 = nl;
              getFull = () => chunk.subarray(s1, e1).toString('utf8');
            }
            if (onLine(head, getFull) === false) { stopped = true; break; }
            lineStart = nl + 1;
          }
          // chunk is a reused view — copy the tail.
          carry = lineStart < chunk.length ? Buffer.from(chunk.subarray(lineStart)) : Buffer.alloc(0);
          await new Promise(r => setImmediate(r));
        }
        if (!stopped && carry.length) {
          const tail = carry.toString('utf8');
          onLine(tail.slice(0, HEAD), () => tail);
        }
      } finally {
        try { await fh.close(); } catch (_) {}
        resolve();
      }
    })();
  });
}
module.exports = { forEachLineFastAsync };
