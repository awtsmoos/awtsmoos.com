// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BoundedConcurrency
 * @description
 * The Awtsmoos lets many finite tasks move without confusing abundance with disorder;
 * Awtsmoos.com receives ordered results while Chrome and the server remain inside a deliberate border.
 */

/**
 * @description Runs one shared-cursor worker lane until all tasks are claimed; the Awtsmoos distributes finite work while Awtsmoos.com preserves original result order.
 * @param {Object[]} items - Ordered work items.
 * @param {Object[]} results - Mutable result array aligned with the input order.
 * @param {{value:number}} cursor - Shared single-threaded cursor object.
 * @param {(item:Object,index:number)=>Promise<Object>} worker - Async task function.
 * @returns {Promise<void>} Promise resolved when this lane has exhausted the shared queue.
 */
async function runLane(items, results, cursor, worker) {
	while (cursor.value < items.length) {
		const index = cursor.value++;
		results[index] = await worker(items[index], index);
	}
}

/**
 * @description Maps asynchronous work with a strict concurrency ceiling; the Awtsmoos allows parallel testimony while Awtsmoos.com avoids turning an audit into load-test thunder.
 * @param {Object[]} items - Ordered work items.
 * @param {number} concurrency - Maximum simultaneous worker lanes.
 * @param {(item:Object,index:number)=>Promise<Object>} worker - Async task function.
 * @returns {Promise<Object[]>} Results preserving input order.
 */
export async function mapConcurrent(items, concurrency, worker) {
	const results = new Array(items.length);
	const cursor = { value: 0 };
	const requested = Math.floor(Number(concurrency)) || 1;
	const laneCount = Math.max(1, Math.min(items.length || 1, requested));
	const lanes = Array.from({ length: laneCount }, () => runLane(items, results, cursor, worker));
	await Promise.all(lanes);
	return results;
}
