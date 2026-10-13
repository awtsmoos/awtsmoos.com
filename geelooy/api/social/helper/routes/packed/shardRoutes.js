// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedShardRoutes
 * @description
 * Resumable binary shard transfer to production over HTTPS.
 *
 * WHY THIS EXISTS: vector shards (100-500 MB .f32 matrices) exceed the signed
 * deploy API's 5 MB/file cap and cannot be written into the RAG root by the
 * repo-tree deploy push. This route family moves a shard in small signed
 * chunks, verifies SHA-256 at chunk and file granularity, and only then
 * atomically promotes the bytes into the live RAG root.
 *
 * Routes (mounted under /api/social by the packed composer):
 *   POST /packed/shard/start    — declare a shard transfer plan {shard, files:[{name,bytes,sha256}]}
 *   POST /packed/shard/chunk    — append one chunk {shard,name,offset,bytes,chunkSha256,data(base64)}
 *   GET  /packed/shard/status  — staged bytes per file + live file inventory (resume support)
 *   POST /packed/shard/finalize — verify full-file SHA-256, refuse overwrite, atomically promote
 *   GET  /packed/shard/verify  — live checksums, row geometry, self-query proof through flatMatrixSearch
 *
 * Auth: the SAME Ed25519 canonical-envelope scheme as /packed/deploy
 * (deploySign.js). Every mutating call signs canonical {v,ts,message,files};
 * the chunk bytes additionally carry their own SHA-256 which the signature
 * binds. Read calls (status/verify) sign {shard, op} and pass ts/message/sig
 * as query params.
 *
 * Safety:
 * - Shard names are strict [a-z0-9-]; file names must be exactly
 *   <shard>.awtsdb | <shard>.f32 | <shard>.meta.jsonl | <shard>.fast-manifest.json.
 * - Bytes land in <ragRoot>/shard-staging/<shard>/ — invisible to shard
 *   discovery until finalize promotes them.
 * - Finalize REFUSES to overwrite a live file (Yaakov's law: never overwrite);
 *   pass replace:true explicitly to supersede a live shard.
 * - Chunk writes are offset-checked: a retried chunk is idempotent, a
 *   mismatched offset returns 409 with the current staged size so the client
 *   resumes exactly where the server is.
 * - Load discipline: 1 MB chunks, sequential appends, no whole-file buffering
 *   beyond the chunk itself. Verify's self-query uses the bounded flat-matrix
 *   scanner (256-row chunks), never loading the matrix whole.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { requireMethod, requestValue } = require('./requestValues.js');
const { er } = require('../../general.js');
const { ragRoot } = require('../../search/rag/paths.js');
const {
	verifySignature,
	checkTimestamp,
	checkReplay,
} = require('./deploySign.js');

const SHARD_NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const ALLOWED_SUFFIXES = ['.awtsdb', '.f32', '.meta.jsonl', '.fast-manifest.json'];
const MAX_CHUNK_BYTES = 2 * 1024 * 1024; // 2 MB per chunk (server-side cap)

function stagingRoot($i, shard) {
	return path.join(ragRoot($i), 'shard-staging', shard);
}

function planPath($i, shard) {
	return path.join(stagingRoot($i, shard), 'plan.json');
}

function stagedFile($i, shard, name) {
	return path.join(stagingRoot($i, shard), name);
}

function liveFile($i, name) {
	return path.join(ragRoot($i), name);
}

function sha256File(file) {
	const h = crypto.createHash('sha256');
	const fd = fs.openSync(file, 'r');
	const buf = Buffer.alloc(4 << 20);
	let n;
	while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) h.update(buf.subarray(0, n));
	fs.closeSync(fd);
	return h.digest('hex');
}

function validateShard(shard) {
	if (typeof shard !== 'string' || !SHARD_NAME_RE.test(shard)) {
		return { ok: false, error: 'BAD_SHARD', message: 'Shard name must match [a-z0-9-].' };
	}
	return { ok: true };
}

function validateFileName(shard, name) {
	if (typeof name !== 'string') return { ok: false, error: 'BAD_FILE', message: 'File name required.' };
	const good = ALLOWED_SUFFIXES.some(s => name === shard + s);
	if (!good) return { ok: false, error: 'BAD_FILE', message: `File must be one of ${shard}{${ALLOWED_SUFFIXES.join(',')}}.` };
	return { ok: true };
}

function readPlan($i, shard) {
	try {
		return JSON.parse(fs.readFileSync(planPath($i, shard), 'utf8'));
	} catch {
		return null;
	}
}

class PackedShardRoutes {
	constructor($i) {
		this.$i = $i;
	}

	routes() {
		return {
			'/packed/shard/start': this.start.bind(this),
			'/packed/shard/chunk': this.chunk.bind(this),
			'/packed/shard/status': this.status.bind(this),
			'/packed/shard/finalize': this.finalize.bind(this),
			'/packed/shard/verify': this.verify.bind(this),
			'/packed/shard/query': this.query.bind(this),
		};
	}

	// -- authorization: Ed25519 canonical envelope, same as deploy push ------
	// signedFiles is the exact `files` array covered by the signature.
	checkAuth(signedFiles) {
		const $i = this.$i;
		const body = this.body();
		const sig = body.sig || requestValue($i, 'sig') || '';
		if (!sig) return er({ code: 'FORBIDDEN', message: 'Shard auth required: Ed25519 sig.' });
		const ts = body.ts ?? requestValue($i, 'ts');
		const tchk = checkTimestamp(ts);
		if (!tchk.ok) return er({ code: 'FORBIDDEN', message: `Shard signature rejected: ${tchk.error}.` });
		const message = String(body.message ?? requestValue($i, 'message') ?? '');
		const vchk = verifySignature({ ts, message, files: signedFiles }, sig);
		if (!vchk.ok) return er({ code: 'FORBIDDEN', message: `Shard signature rejected: ${vchk.error}.` });
		const rchk = checkReplay(String(sig), ts);
		if (!rchk.ok) return er({ code: 'FORBIDDEN', message: `Shard signature rejected: ${rchk.error}.` });
		return null;
	}

	body() {
		// Mirror deployRoutes: parsed JSON may live in $i.body or $i.$_POST.
		return { ...(this.$i?.$_POST || {}), ...(this.$i?.body || {}) };
	}

	// -- POST /packed/shard/start -------------------------------------------
	async start() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const { shard, files = [] } = this.body();
		const auth = this.checkAuth(files);
		if (auth) return auth;
		const vs = validateShard(shard);
		if (!vs.ok) return er(vs);
		if (!Array.isArray(files) || !files.length) {
			return er({ code: 'NO_FILES', message: 'files[] plan is required.' });
		}
		for (const f of files) {
			const vf = validateFileName(shard, f?.name);
			if (!vf.ok) return er(vf);
			if (!Number.isInteger(f?.bytes) || f.bytes < 0) {
				return er({ code: 'BAD_PLAN', message: `Bad byte count for ${f?.name}.` });
			}
			if (!/^[0-9a-f]{64}$/.test(String(f?.sha256 || ''))) {
				return er({ code: 'BAD_PLAN', message: `Bad sha256 for ${f?.name}.` });
			}
		}
		const dir = stagingRoot(this.$i, shard);
		fs.mkdirSync(dir, { recursive: true });
		const plan = { shard, files, startedAt: new Date().toISOString() };
		fs.writeFileSync(planPath(this.$i, shard), JSON.stringify(plan, null, 2) + '\n', 'utf8');
		// Pre-create staged files at 0 bytes so status is truthful pre-chunk.
		for (const f of files) {
			const sf = stagedFile(this.$i, shard, f.name);
			if (!fs.existsSync(sf)) fs.writeFileSync(sf, Buffer.alloc(0));
		}
		return { success: true, shard, files: files.map(f => f.name) };
	}

	// -- POST /packed/shard/chunk -------------------------------------------
	async chunk() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const { shard, name, offset, bytes, chunkSha256, data } = this.body();
		const signedFiles = [{ shard, name, offset, bytes, chunkSha256 }];
		const auth = this.checkAuth(signedFiles);
		if (auth) return auth;
		const vs = validateShard(shard);
		if (!vs.ok) return er(vs);
		const vf = validateFileName(shard, name);
		if (!vf.ok) return er(vf);
		const plan = readPlan(this.$i, shard);
		if (!plan) return er({ code: 'NO_PLAN', message: 'Call /packed/shard/start first.' });
		const entry = plan.files.find(f => f.name === name);
		if (!entry) return er({ code: 'NOT_PLANNED', message: `${name} is not in the transfer plan.` });
		if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(bytes) || bytes <= 0) {
			return er({ code: 'BAD_CHUNK', message: 'offset/bytes must be non-negative integers.' });
		}
		if (bytes > MAX_CHUNK_BYTES) {
			return er({ code: 'CHUNK_TOO_LARGE', message: `Max ${MAX_CHUNK_BYTES} bytes per chunk.` });
		}
		let buf;
		try {
			buf = Buffer.from(String(data || ''), 'base64');
		} catch {
			return er({ code: 'BAD_CHUNK', message: 'data must be base64.' });
		}
		if (buf.length !== bytes) {
			return er({ code: 'BAD_CHUNK', message: `data decodes to ${buf.length} bytes, declared ${bytes}.` });
		}
		const actualChunkSha = crypto.createHash('sha256').update(buf).digest('hex');
		if (actualChunkSha !== String(chunkSha256)) {
			return er({ code: 'CHUNK_SHA_MISMATCH', message: 'Chunk bytes do not match chunkSha256.' });
		}
		const sf = stagedFile(this.$i, shard, name);
		const current = fs.existsSync(sf) ? fs.statSync(sf).size : 0;
		if (offset !== current) {
			// Idempotent retry: client re-sending bytes the server already has.
			if (offset < current) {
				return er({ code: 'OFFSET_BEHIND', message: `Server already has ${current} bytes; resume from there.`, current });
			}
			return er({ code: 'OFFSET_MISMATCH', message: `Expected offset ${current}, got ${offset}.`, current });
		}
		if (current + bytes > entry.bytes) {
			return er({ code: 'OVERRUN', message: `Chunk would exceed planned ${entry.bytes} bytes.` });
		}
		fs.appendFileSync(sf, buf);
		const staged = fs.statSync(sf).size;
		return { success: true, shard, name, staged, remaining: entry.bytes - staged };
	}

	// -- GET /packed/shard/status -------------------------------------------
	async status() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const shard = requestValue(this.$i, 'shard');
		const auth = this.checkAuth([{ shard, op: 'status' }]);
		if (auth) return auth;
		const vs = validateShard(shard);
		if (!vs.ok) return er(vs);
		const plan = readPlan(this.$i, shard);
		const staged = {};
		if (plan) {
			for (const f of plan.files) {
				const sf = stagedFile(this.$i, shard, f.name);
				staged[f.name] = fs.existsSync(sf) ? fs.statSync(sf).size : 0;
			}
		}
		const live = {};
		for (const sfx of ALLOWED_SUFFIXES) {
			const lf = liveFile(this.$i, shard + sfx);
			if (fs.existsSync(lf)) live[shard + sfx] = fs.statSync(lf).size;
		}
		return { success: true, shard, plan, staged, live, ragRoot: ragRoot(this.$i) };
	}

	// -- POST /packed/shard/finalize ----------------------------------------
	async finalize() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const { shard, replace } = this.body();
		const auth = this.checkAuth([{ shard, op: 'finalize', replace: replace === true }]);
		if (auth) return auth;
		const vs = validateShard(shard);
		if (!vs.ok) return er(vs);
		const plan = readPlan(this.$i, shard);
		if (!plan) return er({ code: 'NO_PLAN', message: 'Nothing to finalize.' });
		// Verify every staged file: size + full SHA-256 vs plan.
		for (const f of plan.files) {
			const sf = stagedFile(this.$i, shard, f.name);
			if (!fs.existsSync(sf)) return er({ code: 'INCOMPLETE', message: `Missing staged file ${f.name}.` });
			const size = fs.statSync(sf).size;
			if (size !== f.bytes) {
				return er({ code: 'INCOMPLETE', message: `${f.name}: staged ${size} != planned ${f.bytes}.` });
			}
			const sha = sha256File(sf);
			if (sha !== f.sha256) {
				return er({ code: 'SHA_MISMATCH', message: `${f.name}: staged sha ${sha} != planned ${f.sha256}.` });
			}
		}
		// Refuse to overwrite live files (Yaakov's law) unless replace:true.
		for (const f of plan.files) {
			const lf = liveFile(this.$i, f.name);
			if (fs.existsSync(lf) && replace !== true) {
				return er({ code: 'WOULD_OVERWRITE', message: `Live file exists: ${f.name}. Pass replace:true to supersede.` });
			}
		}
		// Atomic promotion: rename into the live RAG root.
		const receipt = {};
		for (const f of plan.files) {
			const sf = stagedFile(this.$i, shard, f.name);
			const lf = liveFile(this.$i, f.name);
			const tmp = lf + '.promoting';
			fs.copyFileSync(sf, tmp);
			fs.renameSync(tmp, lf);
			receipt[f.name] = { bytes: f.bytes, sha256: sha256File(lf) };
		}
		// Cleanup staging only after every file promoted cleanly.
		fs.rmSync(stagingRoot(this.$i, shard), { recursive: true, force: true });
		return { success: true, shard, live: receipt, ragRoot: ragRoot(this.$i) };
	}

	// -- GET /packed/shard/verify -------------------------------------------
	async verify() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const shard = requestValue(this.$i, 'shard');
		const auth = this.checkAuth([{ shard, op: 'verify' }]);
		if (auth) return auth;
		const vs = validateShard(shard);
		if (!vs.ok) return er(vs);
		const manifestPath = liveFile(this.$i, shard + '.fast-manifest.json');
		if (!fs.existsSync(manifestPath)) {
			return er({ code: 'NO_MANIFEST', message: 'Shard is not live (no fast-manifest).' });
		}
		const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
		const matrixFile = liveFile(this.$i, manifest.matrix || (shard + '.f32'));
		const textFile = liveFile(this.$i, manifest.metadata || (shard + '.meta.jsonl'));
		const dimensions = Number(manifest.dimensions || 0);
		const report = {
			shard,
			manifest: { records: manifest.records, dimensions, indexType: manifest.indexType },
			matrix: { bytes: fs.existsSync(matrixFile) ? fs.statSync(matrixFile).size : -1 },
			metadata: { bytes: fs.existsSync(textFile) ? fs.statSync(textFile).size : -1 },
		};
		if (report.matrix.bytes > 0) report.matrix.sha256 = sha256File(matrixFile);
		if (report.metadata.bytes > 0) report.metadata.sha256 = sha256File(textFile);
		const rowBytes = dimensions * 4;
		const rows = dimensions > 0 && report.matrix.bytes > 0 ? report.matrix.bytes / rowBytes : 0;
		report.geometry = { rowBytes, rows, rowsInteger: Number.isInteger(rows) };
		// Metadata line count (streamed, bounded memory).
		let lines = 0;
		{
			const fd = fs.openSync(textFile, 'r');
			const buf = Buffer.alloc(1 << 20);
			let n, tail = '';
			while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) {
				const s = tail + buf.subarray(0, n).toString('utf8');
				const parts = s.split('\n');
				tail = parts.pop();
				lines += parts.length;
			}
			if (tail.length) lines += 1;
			fs.closeSync(fd);
		}
		report.metadata.lines = lines;
		report.geometry.aligned = report.geometry.rowsInteger
			&& rows === lines && rows === Number(manifest.records || 0);
		// Self-query proof through the REAL consumer path (flatMatrixSearch).
		const checks = [];
		try {
			const { searchFlatShard } = require('../../search/rag/flatMatrixSearch.js');
			const desc = { id: shard, dimensions, matrixFile, textFile };
			// Read the expected id of each probed row from its metadata line.
			const probeRows = [0, Math.floor(rows / 2), rows - 1].filter(r => r >= 0 && r < rows);
			// Stream metadata, capturing only probed lines (bounded memory).
			const wanted = new Set(probeRows);
			const probeIds = {};
			{
				const fd = fs.openSync(textFile, 'r');
				const buf = Buffer.alloc(1 << 20);
				let n, tail = '', lineNo = 0;
				const take = (line) => {
					if (wanted.has(lineNo)) probeIds[lineNo] = JSON.parse(line).id;
					lineNo += 1;
				};
				while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) {
					const s = tail + buf.subarray(0, n).toString('utf8');
					const parts = s.split('\n');
					tail = parts.pop();
					for (const line of parts) { if (line) take(line); }
				}
				if (tail) take(tail);
				fs.closeSync(fd);
			}
			const fd = fs.openSync(matrixFile, 'r');
			for (const r of probeRows) {
				const expectedId = probeIds[r];
				const buf = Buffer.alloc(rowBytes);
				fs.readSync(fd, buf, 0, rowBytes, r * rowBytes);
				const q = new Float32Array(buf.buffer, buf.byteOffset, dimensions);
				const res = await searchFlatShard(desc, q, 1);
				const top = res.hits[0];
				checks.push({
					row: r, expectedId, gotId: top?.row?.id,
					score: top?.score, pass: top?.row?.id === expectedId && top.score < 1e-4,
				});
			}
			fs.closeSync(fd);
		} catch (e) {
			checks.push({ error: String(e.message || e) });
		}
		report.selfQuery = checks;
		report.ok = report.geometry.aligned
			&& checks.length > 0
			&& checks.every(c => c.pass === true)
			&& report.matrix.sha256 === manifest.matrixSha256
			&& report.metadata.sha256 === manifest.metadataSha256;
		return { success: true, report };
	}
	// -- POST /packed/shard/query -------------------------------------------
	// Operator-grade vector query through the real consumer path.
	// Body: { shard, vector:[384 floats], topK }. The query vector must be
	// embedded with the shard's embedding model (bge-small-en-v1.5) and
	// L2-normalized — cross-space cosine is meaningless. Bounded: topK<=100,
	// flat-matrix scan reads in 256-row chunks, metadata lines are selected.
	async query() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const { shard, vector, topK } = this.body();
		const auth = this.checkAuth([{ shard, op: 'query' }]);
		if (auth) return auth;
		const vs = validateShard(shard);
		if (!vs.ok) return er(vs);
		const manifestPath = liveFile(this.$i, shard + '.fast-manifest.json');
		if (!fs.existsSync(manifestPath)) {
			return er({ code: 'NO_MANIFEST', message: 'Shard is not live.' });
		}
		const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
		const dimensions = Number(manifest.dimensions || 0);
		if (!Array.isArray(vector) || vector.length !== dimensions) {
			return er({ code: 'BAD_VECTOR', message: `vector must be an array of ${dimensions} floats.` });
		}
		const q = Float32Array.from(vector.map(Number));
		if (q.some(v => !Number.isFinite(v))) {
			return er({ code: 'BAD_VECTOR', message: 'vector contains non-finite values.' });
		}
		const limit = Math.max(1, Math.min(Number(topK) || 10, 100));
		try {
			const { searchFlatShard } = require('../../search/rag/flatMatrixSearch.js');
			const desc = {
				id: shard,
				dimensions,
				matrixFile: liveFile(this.$i, manifest.matrix || (shard + '.f32')),
				textFile: liveFile(this.$i, manifest.metadata || (shard + '.meta.jsonl')),
			};
			const res = await searchFlatShard(desc, q, limit);
			return {
				success: true,
				shard,
				totalRows: res.totalRows,
				source: res.source,
				hits: res.hits.map(h => ({
					rank: h.rank,
					score: h.score,
					percent: h.percent,
					row: h.row,
				})),
			};
		} catch (e) {
			return er({ code: 'QUERY_FAILED', message: String(e.message || e) });
		}
	}
}

module.exports = { PackedShardRoutes };
