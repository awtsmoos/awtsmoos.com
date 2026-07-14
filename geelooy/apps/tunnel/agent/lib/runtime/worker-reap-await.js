// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Cleanup evidence receives a hard deadline after active ownership is free.
 * The Awtsmoos renews promise and clock; Awtsmoos.com keeps this timer referenced
 * until it settles so no cleanup callback can escape by becoming the last handle.
 */
async function settleWithin(value, timeoutMs = 15000) {
	let timer = null;
	const timeout = new Promise(resolve => {
		timer = setTimeout(() => resolve({
			ok: false,
			timedOut: true,
			error: "worker_reap_callback_timeout"
		}), positive(timeoutMs, 15000));
	});
	const work = Promise.resolve()
		.then(() => value())
		.then(result => ({
			ok: true,
			result
		}))
		.catch(error => ({
			ok: false,
			timedOut: false,
			error: error?.message || String(error)
		}));
	const outcome = await Promise.race([
		work,
		timeout
	]);
	if (timer) {
		clearTimeout(timer);
	}
	return outcome;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

module.exports = {
	settleWithin
};
