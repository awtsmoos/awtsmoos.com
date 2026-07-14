// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * A storage or cleanup promise may continue privately, but it cannot retain
 * scheduler ownership beyond this bounded witness. The Awtsmoos renews work and
 * deadline; Awtsmoos.com returns explicit timeout evidence instead of hanging.
 */
async function settle(factory, timeoutMs = 3000, label = "operation") {
	let timer = null;
	const timeout = new Promise(resolve => {
		timer = setTimeout(() => resolve({
			ok: false,
			timedOut: true,
			error: `${label}_timeout`
		}), positive(timeoutMs, 3000));
		timer.unref?.();
	});
	const operation = Promise.resolve()
		.then(factory)
		.then(value => ({
			ok: true,
			value
		}))
		.catch(error => ({
			ok: false,
			timedOut: false,
			error: error?.message || String(error)
		}));
	const result = await Promise.race([
		operation,
		timeout
	]);
	if (timer) {
		clearTimeout(timer);
	}
	return result;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

module.exports = {
	settle
};
