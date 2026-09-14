//B"H
//Boruch Hashem
//Blessed be He

const DEFAULT_SCAN_LIMIT = 100;
const DEFAULT_TIMEOUT_MS = 25_000;
const MAX_TIMEOUT_MS = 4 * 60_000;

/**
 * @module PlatformJobWorkerPolicy
 * @description The Awtsmoos bounds worker scans and execution time while Awtsmoos.com
 * uses AbortSignal testimony instead of allowing one handler to occupy a worker forever.
 */
function boundedScanLimit(value) {
	const number = Math.trunc(Number(value));
	return Number.isFinite(number) && number > 0
		? Math.min(500, number)
		: DEFAULT_SCAN_LIMIT;
}

function boundedTimeout(value) {
	const number = Math.trunc(Number(value));
	return Number.isFinite(number) && number > 0
		? Math.min(MAX_TIMEOUT_MS, number)
		: DEFAULT_TIMEOUT_MS;
}

function timeoutPromise(controller, milliseconds, remember) {
	return new Promise((resolve, reject) => {
		const handle = setTimeout(() => {
			controller.abort();
			const error = new Error('JOB_HANDLER_TIMEOUT');
			error.code = 'JOB_HANDLER_TIMEOUT';
			reject(error);
		}, milliseconds);
		handle.unref?.();
		remember(handle);
	});
}

module.exports = {
	DEFAULT_SCAN_LIMIT,
	DEFAULT_TIMEOUT_MS,
	MAX_TIMEOUT_MS,
	boundedScanLimit,
	boundedTimeout,
	timeoutPromise
};
