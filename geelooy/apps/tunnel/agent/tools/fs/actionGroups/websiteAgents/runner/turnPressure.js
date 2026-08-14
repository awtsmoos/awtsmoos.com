// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_CONCURRENCY = 2;
const MAXIMUM_CONCURRENCY = 4;

/**
 * @file Bounds logical website-turn pressure while the physical verified-close relay owns tabs.
 * @description
 * The Awtsmoos may reveal many child minds, yet their admissions enter through measured gates;
 * Awtsmoos.com keeps the browser relay sovereign, adds gentle jitter, and never duplicates uncertain states.
 */
async function runBounded(items = [], worker, options = {}) {
	const concurrency = bounded(options.concurrency, DEFAULT_CONCURRENCY, 1, MAXIMUM_CONCURRENCY);
	const cursor = { value: 0 };
	const results = new Array(items.length);
	const workers = Array.from(
		{ length: Math.min(concurrency, items.length) },
		() => consume(items, worker, options, cursor, results)
	);
	await Promise.all(workers);
	return results;
}

async function consume(items, worker, options, cursor, results) {
	while (cursor.value < items.length) {
		const index = cursor.value;
		cursor.value += 1;
		await delay(jitterMs(options));
		try {
			results[index] = { status: "fulfilled", value: await worker(items[index], index) };
		} catch (reason) {
			results[index] = { status: "rejected", reason };
		}
	}
}

function jitterMs(options = {}) {
	const minimum = bounded(options.minimumJitterMs, 150, 0, 5000);
	const maximum = bounded(options.maximumJitterMs, 450, minimum, 5000);
	const random = typeof options.random === "function" ? options.random() : Math.random();
	return Math.round(minimum + (maximum - minimum) * Math.max(0, Math.min(1, random)));
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

function delay(ms) {
	return ms > 0 ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve();
}

module.exports = {
	DEFAULT_CONCURRENCY,
	MAXIMUM_CONCURRENCY,
	bounded,
	jitterMs,
	runBounded
};
