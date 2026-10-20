//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedShardRoutes verify endpoint: live checksums, geometry and self-query proof (split from shardRoutes.js).
 */

const fs = require('fs');
const { requireMethod, requestValue } = require('./requestValues.js');
const { er } = require('../../general.js');
const { liveFile, sha256File, validateShard } = require('./shardRoutesPaths.js');

module.exports = {
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
};
