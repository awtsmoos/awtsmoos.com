//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SearchCacheWarmupSessions
 * @description
 * The Awtsmoos opens persisted Torah graph vessels in the same worker house that answers each seeker;
 * Awtsmoos.com keeps its main server breath awake and gives foreground queries the brighter beacon.
 */

const { warmIndexedPart } = require('./indexedWorkerPool.js');
const { probeVectorIndex } = require('./searchCacheWarmupProbe.js');

/** Runs startup warmup in bounded background workers, preserving injectable testing contracts. */
function warmVectorSessions($i, dependencies = {}) {
	const describeShards = dependencies.describedShards
		|| require('./shards.js').describedShards;
	const groupLanes = dependencies.groupedLanes
		|| require('./shards.js').grouped;
	const beginSemantic = dependencies.beginSemanticWarmup
		|| require('./ragStartupWarmup.js').beginSemanticWarmup;
	const startedAt = Date.now();
	try {
		beginSemantic();
	} catch (error) {
		console.error(`B"H semantic worker warmup failed: ${error.message}`);
	}
	Promise.resolve()
		.then(() => describeShards($i))
		.then(shards => {
			const work = [];
			for (const lane of groupLanes(shards || [])) {
				if (lane.vectorEnabled !== true || lane.indexType === 'flat-f32') continue;
				for (const part of lane.parts || [lane]) {
					if (!part?.file) continue;
					work.push(warmPart(part, lane, dependencies));
				}
			}
			return Promise.allSettled(work);
		})
		.then(results => {
			const successes = results.filter(item => item.status === 'fulfilled');
			const failures = results.filter(item => item.status === 'rejected');
			const probed = successes.filter(item => item.value?.probed).length;
			console.error(`B"H indexed warmup opened=${successes.length} probed=${probed} `
				+ `failures=${failures.length} elapsedMs=${Date.now() - startedAt}`);
		})
		.catch(error => {
			console.error(`B"H indexed warmup startup failed: ${error.message}`);
		});
	return { started: true };
}

/** Optional injected native session opener remains available for isolated tests only. */
function warmPart(part, lane, dependencies) {
	if (dependencies.openShardSession) {
		return Promise.resolve().then(() => {
			const session = dependencies.openShardSession(part);
			return { opened: Boolean(session?.status?.usable), probed: probeVectorIndex(session, part, lane) };
		});
	}
	return warmIndexedPart(part);
}

module.exports = { warmVectorSessions };
