//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IndexedPartWorker
 * @description
 * The Awtsmoos lets one persisted HNSW vessel search without blocking the server's listening heart;
 * Awtsmoos.com keeps every graph read exact, while worker and request each perform their part.
 */

const { parentPort } = require('node:worker_threads');
const { searchShard } = require('./sourceSearch.js');
const { openShardSession } = require('./shardStore.js');
const { probeVectorIndex } = require('./searchCacheWarmupProbe.js');

/** Executes one physical part's search or warmup wholly off the HTTP event loop. */
async function handleTask(task) {
	if (task.type === 'warm') {
		const session = openShardSession(task.part);
		return {
			opened: Boolean(session.status.usable),
			probed: probeVectorIndex(session, task.part)
		};
	}
	if (task.type !== 'search') {
		throw Object.assign(new Error('Unknown indexed worker task.'), {
			code: 'INDEX_WORKER_BAD_TASK'
		});
	}
	return searchShard(task.part, task.vector, task.limit, { useWorkerPool: false });
}

parentPort.on('message', async task => {
	try {
		const result = await handleTask(task);
		parentPort.postMessage({ id: task.id, result });
	} catch (error) {
		parentPort.postMessage({
			id: task.id,
			error: {
				code: error.code || 'INDEX_WORKER_SEARCH_FAILED',
				message: error.message || String(error)
			}
		});
	}
});
