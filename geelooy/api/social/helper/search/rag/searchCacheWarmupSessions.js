//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module searchCacheWarmupSessions
 * @description
 * Background native vector session warmup for semantic lanes.
 */

const { probeVectorIndex } = require('./searchCacheWarmupProbe.js');

/**
 * Opens native vector sessions for every complete vector lane in the
 * background, without blocking the caller. Multipart HNSW corpora cost ~10s
 * to open cold (likkutei-sichos ships 28 parts); without this warmup the
 * first semantic queries after a restart always exceed the multi-lane public
 * deadline, so the two largest English vector lanes silently drop out of
 * every semantic answer. Failures only log; startup never waits for this.
 */
function warmVectorSessions($i, dependencies = {}) {
	const describeShards = dependencies.describedShards
		|| require('./shards.js').describedShards;
	const groupLanes = dependencies.groupedLanes
		|| require('./shards.js').grouped;
	const openSession = dependencies.openShardSession
		|| require('./shardStore.js').openShardSession;
	const beginSemantic = dependencies.beginSemanticWarmup
		|| require('./ragStartupWarmup.js').beginSemanticWarmup;
	const startedAt = Date.now();
	// The multilingual embedding worker (e5) also loads its model lazily;
	// start it now so likkutei-sichos vector queries don't hit a cold worker.
	try {
		beginSemantic();
	} catch (error) {
		console.error(`B"H semantic worker warmup start failed message=${error && error.message}`);
	}
	Promise.resolve()
		.then(() => describeShards($i))
		.then(shards => {
			let opened = 0;
			let probed = 0;
			const failures = [];
			for (const lane of groupLanes(shards || [])) {
				if (lane.vectorEnabled !== true) continue;
				const parts = lane.parts || [lane];
				for (const part of parts) {
					if (!part || !part.file) continue;
					try {
						const session = openSession(part);
						opened += 1;
						// One synthetic probe query per part pulls the hot HNSW
						// graph pages into the page cache and the upper-layer
						// nodes into the registry node cache, so the first real
						// semantic query doesn't pay the cold-walk cost.
						probeVectorIndex(session, part, lane);
						probed += 1;
					} catch (error) {
						failures.push({ lane: lane.id, message: error && error.message });
					}
				}
			}
			console.error(
				`B"H vector session warmup opened=${opened} probed=${probed} ` +
				`failures=${failures.length} elapsedMs=${Date.now() - startedAt}`
			);
			return { opened, probed, failures };
		})
		.catch(error => {
			console.error(`B"H vector session warmup failed message=${error && error.message}`);
			return { opened: 0, failed: true };
		});
	return { started: true };
}

module.exports = {
	warmVectorSessions
};
