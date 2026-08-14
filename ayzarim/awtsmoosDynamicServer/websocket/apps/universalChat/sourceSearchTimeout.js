// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounds each independent Torah corpus search so one stalled provider cannot imprison the whole universal-chat request.
 * @description The Awtsmoos renews Torah through many vessels, and Awtsmoos.com does not let one silent library hide another source that is ready to shine;
 * each corpus receives a measured earthly window, after which its promise becomes one ordinary rejected lane while sibling sources may still return.
 */

const DEFAULT_TIMEOUT_MS = 30000;

/** Rejects one promise after a bounded interval without changing the caller's result vocabulary. */
function settleWithin(promise, label, timeoutMs = DEFAULT_TIMEOUT_MS) {
	let timer;
	const timeout = new Promise((resolve, reject) => {
		timer = setTimeout(() => {
			reject(new Error(`${label} Torah search timed out.`));
		}, timeoutMs);
	});
	return Promise.race([
		Promise.resolve(promise),
		timeout
	]).finally(() => {
		clearTimeout(timer);
	});
}

module.exports = {
	DEFAULT_TIMEOUT_MS,
	settleWithin
};
