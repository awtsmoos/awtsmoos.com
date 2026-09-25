//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file searchCatalogWorkerClient.js
 * @description
 * The Awtsmoos grants cold catalog work its own finite thread-vessel; Awtsmoos.com
 * makes timeout testimony authoritative before termination can emit an exit event,
 * so physical cancellation and public truth remain one undivided boundary.
 */

const path = require('node:path');
const { Worker } = require('node:worker_threads');

const DEFAULT_CATALOG_WARM_TIMEOUT_MS = 15000;

/** Converts any worker failure into compact serializable testimony. */
function errorShape(error, fallbackCode = 'SEARCH_CATALOG_WARM_FAILED') {
	return {
		code: error?.code || fallbackCode,
		message: error?.message || 'Search catalog warm worker failed.'
	};
}

/** Terminates one worker without allowing cleanup failure to mask the real result. */
async function terminateWorker(worker) {
	try {
		await worker?.terminate?.();
	} catch (_) {
		// The worker may already have exited after its final message.
	}
}

/** Runs one worker-thread catalog decode under a physically enforceable deadline. */
function runCatalogWarmWorker(directory, options = {}) {
	const WorkerClass = options.WorkerClass || Worker;
	const workerFile = options.workerFile || path.join(__dirname, 'searchCatalogWarmWorker.js');
	const timeoutMs = Math.max(1, Number(options.timeoutMs || DEFAULT_CATALOG_WARM_TIMEOUT_MS));
	const startedAt = Date.now();
	return new Promise(resolve => {
		let settled = false;
		let timer = null;
		const worker = new WorkerClass(workerFile, { workerData: { directory } });
		const finish = result => {
			if (settled) return false;
			settled = true;
			if (timer) clearTimeout(timer);
			resolve({ ...result, elapsedMs: Date.now() - startedAt });
			return true;
		};
		worker.once('message', message => {
			if (message?.ok) finish({ ok: true, result: message.result });
			else finish({ ok: false, error: message?.error || errorShape(null) });
		});
		worker.once('error', error => finish({
			ok: false,
			error: errorShape(error)
		}));
		worker.once('exit', code => {
			if (settled) return;
			const fallback = code === 0
				? 'SEARCH_CATALOG_WORKER_EMPTY'
				: 'SEARCH_CATALOG_WORKER_EXIT';
			finish({ ok: false, error: errorShape(null, fallback) });
		});
		timer = setTimeout(() => {
			const wonTimeoutRace = finish({
				ok: false,
				timeout: true,
				error: errorShape(null, 'SEARCH_CATALOG_WARM_TIMEOUT')
			});
			if (wonTimeoutRace) void terminateWorker(worker);
		}, timeoutMs);
		timer.unref?.();
		worker.unref?.();
	});
}

module.exports = {
	DEFAULT_CATALOG_WARM_TIMEOUT_MS,
	errorShape,
	runCatalogWarmWorker,
	terminateWorker
};
