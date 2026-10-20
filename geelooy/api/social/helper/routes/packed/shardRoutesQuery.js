//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedShardRoutes operator vector query endpoint (split from shardRoutes.js).
 */

const fs = require('fs');
const { requireMethod, requestValue } = require('./requestValues.js');
const { er } = require('../../general.js');
const { liveFile, validateShard } = require('./shardRoutesPaths.js');

module.exports = {
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
};
