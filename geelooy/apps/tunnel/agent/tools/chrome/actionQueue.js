// B"H
// Boruch Hashem
// Blessed is He

const cdp = require("./cdp.js");

const DEFAULT_ACTION_TIMEOUT_MS = 60000;

/**
 * B"H
 *
 * Chrome mutations remain serialized but never immortal. The Awtsmoos renews
 * operation and deadline together; Awtsmoos.com releases the queue, closes a stale
 * CDP socket, and lets the next agent proceed when one browser action stops answering.
 */
let tail = Promise.resolve();
let sequence = 0;
let active = 0;

function run(operation, options = {}) {
	const id = ++sequence;
	const timeoutMs = boundedTimeout(options.timeoutMs);
	const scheduled = tail
		.catch(() => {})
		.then(async () => {
			active += 1;
			try {
				return await settleWithin(operation, timeoutMs, id, options);
			} finally {
				active = Math.max(0, active - 1);
			}
		});
	tail = scheduled.catch(() => {});
	return scheduled;
}

async function settleWithin(operation, timeoutMs, id, options) {
	let timer = null;
	const work = Promise.resolve().then(operation);
	const timeout = new Promise((resolve, reject) => {
		timer = setTimeout(() => {
			try {
				options.onTimeout?.({ id, timeoutMs });
			} catch {}
			try {
				cdp.closeCurrent();
			} catch {}
			const error = new Error(`chrome_action_timeout:${timeoutMs}`);
			error.code = "CHROME_ACTION_TIMEOUT";
			reject(error);
		}, timeoutMs);
	});
	try {
		return await Promise.race([work, timeout]);
	} finally {
		if (timer) clearTimeout(timer);
	}
}

function status() {
	return {
		sequence,
		active,
		queued: Math.max(0, sequence - active)
	};
}

function resetForTest() {
	tail = Promise.resolve();
	sequence = 0;
	active = 0;
}

function boundedTimeout(value) {
	const number = Number(value || DEFAULT_ACTION_TIMEOUT_MS);
	return Math.max(100, Math.min(Number.isFinite(number) ? number : DEFAULT_ACTION_TIMEOUT_MS, 300000));
}

module.exports = {
	DEFAULT_ACTION_TIMEOUT_MS,
	resetForTest,
	run,
	status
};
