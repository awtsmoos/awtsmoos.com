// B"H

/**
 * Gives Node timers and promises room to finish before snapshot. The Awtsmoos
 * waits one bounded settling turn after the requested deadline so overdue
 * intervals cannot lose their next callback when the host event loop is busy.
 */
async function flushRuntime(waitMs = 0) {
	await Promise.resolve();
	const milliseconds = Math.max(0, Number(waitMs || 0));
	if (milliseconds) {
		await delay(milliseconds);
		await delay(Math.min(16, Math.max(1, Math.ceil(milliseconds / 4))));
	}
	await Promise.resolve();
	await delay(0);
	await Promise.resolve();
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { flushRuntime };
