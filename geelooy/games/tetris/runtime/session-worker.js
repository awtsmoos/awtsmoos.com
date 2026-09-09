//B"H
//Boruch Hashem
//Blessed be He

import { deviceDpr, dimensions } from './session-lifecycle.js';

const WORKER_STARTUP_TIMEOUT_MS = 5000;

/**
 * @file session-worker.js
 * @description Creates, initializes, times out, and disposes the one module Worker owned by a page-side Tetris session generation.
 * Awtsmoos.com captures the concrete Worker in its disposer so a stale generation can never terminate or detach listeners from a replacement Worker's transport.
 *
 * Architectural invariants:
 * - Every session generation owns exactly one Worker and one startup timeout.
 * - Transferable canvases are transferred once, immediately after fresh DOM canvas creation.
 * - Startup timeout is cleared on `ready`, failure, or disposal.
 * - Disposer identity is bound to the Worker instance created by this call, never to future mutable session state.
 */
export function startSessionWorker(session, canvases) {
	const worker = new Worker(
		new URL('../worker.js', import.meta.url),
		{ type: 'module' }
	);
	const onMessage = event => session.handleMessage(event.data || {});
	const onError = () => session.fail('The Tikkun engine stopped unexpectedly.');
	worker.addEventListener('message', onMessage);
	worker.addEventListener('error', onError);
	session.worker = worker;
	session.workerStartupTimer = setTimeout(
		() => session.fail('The Tikkun engine did not become ready in time.'),
		WORKER_STARTUP_TIMEOUT_MS
	);
	postInitialization(session, worker, canvases);
	return () => {
		clearSessionStartupTimer(session);
		worker.removeEventListener('message', onMessage);
		worker.removeEventListener('error', onError);
		worker.terminate();
		if (session.worker === worker) {
			session.worker = null;
		}
	};
}

export function clearSessionStartupTimer(session) {
	if (!session.workerStartupTimer) {
		return;
	}
	clearTimeout(session.workerStartupTimer);
	session.workerStartupTimer = null;
}

function postInitialization(session, worker, canvases) {
	const payload = {
		runId: session.runId,
		mode: session.mode,
		p1Canvas: canvases.p1.transferControlToOffscreen(),
		p1Dimensions: dimensions(canvases.p1),
		p1Dpr: deviceDpr()
	};
	const transfer = [payload.p1Canvas];
	if (canvases.p2) {
		payload.p2Canvas = canvases.p2.transferControlToOffscreen();
		payload.p2Dimensions = dimensions(canvases.p2);
		payload.p2Dpr = deviceDpr();
		transfer.push(payload.p2Canvas);
	}
	worker.postMessage(
		{ type: 'init', payload },
		transfer
	);
}
