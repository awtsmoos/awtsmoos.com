// B"H
// Boruch Hashem
// Blessed is He

const cdp = require("./cdp.js");

const DEFAULT_ACTION_TIMEOUT_MS = 60000;
let tail = Promise.resolve();
let sequence = 0;
let queued = 0;
let active = 0;
let completed = 0;
let failed = 0;
let maximumQueued = 0;

/** Serializes single-socket Chrome mutations and releases a timed-out lane. */
function run(operation, options = {}) {
	const id = ++sequence;
	const timeoutMs = boundedTimeout(options.timeoutMs);
	queued += 1;
	maximumQueued = Math.max(maximumQueued, queued + active);
	const scheduled = tail.catch(() => {}).then(async () => {
		queued = Math.max(0, queued - 1);
		active += 1;
		try {
			const result = await settleWithin(operation, timeoutMs, id, options);
			completed += 1;
			return result;
		} catch (error) {
			failed += 1;
			throw error;
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
			try { options.onTimeout?.({ id, timeoutMs }); } catch (_) {}
			try { cdp.closeCurrent(); } catch (_) {}
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

function snapshot() {
	return { sequence, queued, active, completed, failed, maximumQueued };
}

function status() {
	return snapshot();
}

function resetForTests() {
	tail = Promise.resolve();
	sequence = 0;
	queued = 0;
	active = 0;
	completed = 0;
	failed = 0;
	maximumQueued = 0;
}

function boundedTimeout(value) {
	const number = Number(value || DEFAULT_ACTION_TIMEOUT_MS);
	return Math.max(100, Math.min(Number.isFinite(number) ? number : DEFAULT_ACTION_TIMEOUT_MS, 300000));
}

module.exports = {
	DEFAULT_ACTION_TIMEOUT_MS,
	boundedTimeout,
	resetForTest: resetForTests,
	resetForTests,
	run,
	snapshot,
	status
};
