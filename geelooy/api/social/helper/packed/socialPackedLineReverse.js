//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked reverse raw-line async scan (split from socialPacked.js).
 */
const fs = require('fs');
const { fileFor } = require('./socialPackedEngine.js');
function forEachLineReverseAsync(root, shard, onLine, maxBytes = Infinity) {
  return new Promise((resolve) => {
    const file = fileFor(root, shard);
    if (!file || !fs.existsSync(file)) return resolve();
    const CHUNK = 4 * 1024 * 1024;
    const HEAD = 512;
    let fh = null;
    (async () => {
      try { fh = await fs.promises.open(file, 'r'); }
      catch (_) { return resolve(); }
      try {
        const size = (await fh.stat()).size;
        let pos = size;
        let scanned = 0;
        let pending = Buffer.alloc(0);
        let stopped = false;
        const buf = Buffer.allocUnsafe(CHUNK);
        while (pos > 0 && scanned < maxBytes && !stopped) {
          const n = Math.min(CHUNK, pos, maxBytes - scanned);
          const start = pos - n;
          const { bytesRead } = await fh.read(buf, 0, n, start);
          if (bytesRead <= 0) break;
          pos = start; scanned += bytesRead;
          const combined = pending.length ? Buffer.concat([buf.subarray(0, bytesRead), pending]) : buf.subarray(0, bytesRead);
          // Native reverse search (memrchr) — a JS byte loop over 4 MB is ~10x slower.
          const spans = [];
          let cur = combined.length;
          for (;;) {
            const nl = combined.lastIndexOf(0x0A, cur - 1);
            if (nl < 0) break;
            spans.push([nl + 1, cur]);
            cur = nl;
            if (cur <= 0) break;
          }
          pending = combined.subarray(0, cur);
          for (const [a, b] of spans) {
            if (b <= a) continue;
            // Head slice + lazy full materialization (full 300 KB lines as
            // strings would make a whole-file scan crawl).
            const head = combined.subarray(a, Math.min(b, a + HEAD)).toString('utf8');
            const getFull = () => combined.subarray(a, b).toString('utf8');
            if (onLine(head, getFull) === false) { stopped = true; break; }
          }
          await new Promise(r => setImmediate(r));
        }
        if (!stopped && pending.length) {
          const tail = pending.toString('utf8');
          onLine(tail.slice(0, HEAD), () => tail);
        }
      } finally {
        try { await fh.close(); } catch (_) {}
        resolve();
      }
    })();
  });
}
module.exports = { forEachLineReverseAsync };
