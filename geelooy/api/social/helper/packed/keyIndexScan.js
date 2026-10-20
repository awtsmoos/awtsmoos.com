//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PackedKeyIndexScan
 * @description Byte-range scanning and line-head key extraction for the packed key index (split from keyIndex.js, verbatim).
 */

	const fs = require('fs');

/**
 * Scans one byte range of the file, calling onRecord(offset, head) per line.
 * Used for tail catch-up: only bytes appended after the sidecar's size.
 */
async function scanRange(file, from, to, onRecord) {
	if (to <= from) return;
	const CHUNK = 4 * 1024 * 1024;
	const HEAD = 512;
	let fh = null;
	try {
		fh = await fs.promises.open(file, 'r');
		let pos = from;
		let pending = Buffer.alloc(0);
		const buf = Buffer.allocUnsafe(CHUNK);
		while (pos < to) {
			const n = Math.min(CHUNK, to - pos);
			const { bytesRead } = await fh.read(buf, 0, n, pos);
			if (bytesRead <= 0) break;
			const combined = pending.length
				? Buffer.concat([pending, buf.subarray(0, bytesRead)])
				: buf.subarray(0, bytesRead);
			let lineStart = pos - pending.length;
			let cur = 0;
			for (;;) {
				const nl = combined.indexOf(0x0A, cur);
				if (nl < 0) break;
				const head = combined.subarray(cur, Math.min(nl, cur + HEAD)).toString('utf8');
				const keep = onRecord(lineStart, head);
				if (keep === false) { await fh.close(); return; }
				cur = nl + 1;
				lineStart = pos - pending.length + cur;
			}
			pending = combined.subarray(cur);
			pos += bytesRead;
			await new Promise(r => setImmediate(r));
		}
		if (pending.length) {
			onRecord(to - pending.length, pending.subarray(0, HEAD).toString('utf8'));
		}
	} finally {
		try { await fh?.close(); } catch { /* ignore */ }
	}
}

/** Extracts the envelope key from a line head without full JSON.parse. */
function keyOfHead(head) {
	const m = /"key"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(head);
	if (!m) return null;
	try {
		return JSON.parse(`"${m[1]}"`);
	} catch {
		return m[1];
	}
}

module.exports = {
	keyOfHead,
	scanRange
};
