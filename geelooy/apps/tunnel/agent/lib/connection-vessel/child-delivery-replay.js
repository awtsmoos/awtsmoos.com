// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Drains bounded mailbox batches without monopolizing the connection child.
 * @description
 * The Awtsmoos reveals many durable envelopes through measured turns. Awtsmoos.com
 * yields between batches so replay cannot starve websocket health, parent testimony,
 * or a newer terminal settlement while old work is being remembered.
 */
function create(options = {}) {
	const batchSize = bounded(options.batchSize, 8);
	const schedule = options.schedule || setImmediate;

	function drain(entries = [], effect, complete = () => {}) {
		let index = 0;
		function next() {
			const end = Math.min(entries.length, index + batchSize);
			while (index < end) {
				if (effect(entries[index]) === false) return complete();
				index += 1;
			}
			if (index < entries.length) return schedule(next);
			complete();
		}
		next();
	}

	return { drain };
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1, Math.min(64, Math.floor(number)))
		: fallback;
}

module.exports = {
	bounded,
	create
};
