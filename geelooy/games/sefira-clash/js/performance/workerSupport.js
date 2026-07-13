//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the worker support vessel in this instant, revealing
 * its focused js performance service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Worker/offscreen capability gate.
 *
 * Chapter 250: some browsers open the worker-gate, some punish it. This module
 * detects the doorway without forcing the whole game through it. The main
 * thread keeps the safe backbuffer path unless a future flag deliberately
 * enables worker rendering.
 */
export function workerSupport(canvas) {
	const worker = typeof Worker !== 'undefined';
	const offscreen = typeof OffscreenCanvas !== 'undefined';
	const transfer = !!canvas && typeof canvas.transferControlToOffscreen === 'function';
	const moduleWorker = worker && supportsModuleWorkerProbe();
	return {
		worker,
		offscreen,
		transfer,
		moduleWorker,
		canRenderWorker: worker && transfer && moduleWorker,
		canSimWorker: worker && moduleWorker
	};
}

/**
 * Reveals the worker rendering enabled behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} canvas The canvas value entering this behavior.
 */
export function workerRenderingEnabled(canvas) {
	try {
		return (
			localStorage.getItem('sefiraWorkerRender') === '1' &&
			workerSupport(canvas).canRenderWorker
		);
	} catch {
		return false;
	}
}

function supportsModuleWorkerProbe() {
	try {
		const blob = new Blob(['export default 1'], { type: 'text/javascript' });
		const url = URL.createObjectURL(blob);
		const w = new Worker(url, { type: 'module' });
		w.terminate();
		URL.revokeObjectURL(url);
		return true;
	} catch {
		return false;
	}
}
