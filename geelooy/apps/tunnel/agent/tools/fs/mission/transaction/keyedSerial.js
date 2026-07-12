// B"H

const queues = new Map();
const metrics = { totalRuns: 0, completedRuns: 0, failedRuns: 0, maxQueuedForKey: 0 };

function getEntry(key) {
	let entry = queues.get(key);
	if (entry) return entry;
	entry = { tail: Promise.resolve(), lastGate: null, waiting: 0, active: 0, runs: 0 };
	queues.set(key, entry);
	return entry;
}

/**
 * B"H — Many messengers may approach one mission, but its written state has
 * one doorway. Each receives a turn; unrelated missions keep walking in parallel,
 * and the doorway vanishes when the last messenger leaves.
 */
async function run(key, operation) {
	if (!key) return operation();
	const entry = getEntry(key);
	const previous = entry.tail;
	let release;
	const gate = new Promise(resolve => { release = resolve; });
	entry.tail = previous.catch(() => {}).then(() => gate);
	entry.lastGate = gate;
	entry.waiting += 1;
	entry.runs += 1;
	metrics.totalRuns += 1;
	metrics.maxQueuedForKey = Math.max(metrics.maxQueuedForKey, entry.waiting + entry.active);
	await previous.catch(() => {});
	entry.waiting -= 1;
	entry.active += 1;
	try {
		const result = await operation();
		metrics.completedRuns += 1;
		return result;
	} catch (error) {
		metrics.failedRuns += 1;
		throw error;
	} finally {
		entry.active -= 1;
		release();
		if (entry.lastGate === gate && entry.waiting === 0 && entry.active === 0) queues.delete(key);
	}
}

function snapshot() {
	return {
		...metrics,
		keys: queues.size,
		queued: [...queues.values()].reduce((total, entry) => total + entry.waiting, 0),
		active: [...queues.values()].reduce((total, entry) => total + entry.active, 0)
	};
}

function resetForTests() {
	queues.clear();
	for (const key of Object.keys(metrics)) metrics[key] = 0;
}

module.exports = { resetForTests, run, snapshot };
