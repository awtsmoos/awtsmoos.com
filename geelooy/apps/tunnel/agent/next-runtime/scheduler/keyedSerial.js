// B"H

/**
 * B"H — One resource receives one orderly doorway while unrelated keys remain
 * free. The doorway disappears when the last operation leaves, so no empty lock
 * survives merely because it once carried work.
 */
function createKeyedSerial() {
	const entries = new Map();
	const metrics = { runs: 0, completed: 0, failed: 0, maxDepth: 0 };

	async function run(key, operation) {
		if (!key) return operation();
		const entry = entries.get(key) || createEntry();
		entries.set(key, entry);
		const previous = entry.tail;
		let release;
		const gate = new Promise(resolve => { release = resolve; });
		entry.tail = previous.catch(() => {}).then(() => gate);
		entry.lastGate = gate;
		entry.waiting += 1;
		metrics.runs += 1;
		metrics.maxDepth = Math.max(metrics.maxDepth, entry.waiting + entry.active);
		await previous.catch(() => {});
		entry.waiting -= 1;
		entry.active += 1;
		try {
			const result = await operation();
			metrics.completed += 1;
			return result;
		} catch (error) {
			metrics.failed += 1;
			throw error;
		} finally {
			entry.active -= 1;
			release();
			if (entry.lastGate === gate && entry.waiting === 0 && entry.active === 0) entries.delete(key);
		}
	}

	function snapshot() {
		return {
			...metrics,
			keys: entries.size,
			waiting: [...entries.values()].reduce((sum, entry) => sum + entry.waiting, 0),
			active: [...entries.values()].reduce((sum, entry) => sum + entry.active, 0)
		};
	}

	return { run, snapshot };
}

function createEntry() {
	return { tail: Promise.resolve(), lastGate: null, waiting: 0, active: 0 };
}

module.exports = { createKeyedSerial };
