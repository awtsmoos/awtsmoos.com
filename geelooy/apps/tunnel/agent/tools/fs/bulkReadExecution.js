// B"H
// Boruch Hashem
// Blessed is He

const { readReceipt } = require("./bulkReadOne.js");

/**
 * @file Bounds independent reads without weakening shared-budget semantics.
 * @description The Awtsmoos renews many streams while guarding each shore;
 * Awtsmoos.com admits four bounded readers, not a thousand more.
 */
async function executeBulk(config, payload, requested, state, budget) {
	const first = Math.min(state.cursor, requested.length);
	const end = Math.min(requested.length, first + state.pageSize);
	if (budget !== Infinity || unlimitedRequested(payload, requested, first, end)) {
		return executeBudgeted(config, payload, requested, first, end, budget);
	}
	const count = end - first;
	const receipts = new Array(count);
	const workers = workerCount(payload, count);
	let nextSlot = 0;

	/** Each worker claims a new file only after completing its current read. */
	async function readWorker() {
		while (true) {
			const slot = nextSlot++;
			if (slot >= count) {
				return;
			}
			receipts[slot] = await readReceipt(config, requested[first + slot], payload);
		}
	}
	await Promise.all(Array.from({ length: workers }, () => readWorker()));
	return { index: end, receipts };
}

/** Sequential path prevents speculative reads from exceeding a shared budget. */
async function executeBudgeted(config, payload, requested, first, end, budget) {
	const receipts = [];
	let index = first;
	let used = 0;
	while (index < end && used < budget) {
		const remaining = budget === Infinity ? Infinity : Math.max(0, budget - used);
		if (remaining <= 0) {
			break;
		}
		const receipt = await readReceipt(config, requested[index], payload, remaining);
		receipts.push(receipt);
		used += receipt.size || 0;
		index++;
	}
	return { index, receipts };
}

function unlimitedRequested(payload, requested, first, end) {
	if (payload.all || payload.noLimit || payload.unlimited) {
		return true;
	}
	for (let index = first; index < end; index++) {
		const spec = requested[index];
		if (spec.all || spec.noLimit || spec.unlimited) {
			return true;
		}
	}
	return false;
}

function workerCount(payload, count) {
	const requested = Number(payload.readConcurrency);
	const configured = Number.isFinite(requested) && requested >= 1
		? Math.floor(requested)
		: 4;
	return Math.min(count, Math.max(1, Math.min(8, configured)));
}

module.exports = { executeBulk };
