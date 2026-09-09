//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file session-lifecycle.js
 * @description Owns resize and page-visibility listeners for one Tetris session generation.
 * Awtsmoos.com keeps browser lifecycle plumbing out of session orchestration so teardown remains explicit and source modules remain small.
 *
 * Invariants:
 * - Hidden documents pause gameplay without clearing a user's manual pause reason.
 * - Resize updates only canvas backing geometry; it never resets board state.
 * - Disposing the binding removes every listener installed by this generation.
 */
export function bindSessionLifecycle(session) {
	const resize = () => postResize(session);
	const visibility = () => {
		if (document.hidden) {
			session.releaseHeldInputs?.();
		}
		postPauseState(session);
	};
	window.addEventListener('resize', resize);
	document.addEventListener('visibilitychange', visibility);
	return () => {
		window.removeEventListener('resize', resize);
		document.removeEventListener('visibilitychange', visibility);
	};
}

export function postPauseState(session) {
	if (!session.worker || session.completed) {
		return;
	}
	const paused = session.manualPause || document.hidden;
	session.worker.postMessage({ type: paused ? 'pause' : 'resume', runId: session.runId });
}

export function postResize(session) {
	if (!session.worker || !session.ready || session.completed) {
		return;
	}
	const payload = {
		p1Dimensions: dimensions(session.view.p1Canvas),
		p1Dpr: deviceDpr()
	};
	if (session.mode !== 'single') {
		payload.p2Dimensions = dimensions(session.view.p2Canvas);
		payload.p2Dpr = deviceDpr();
	}
	session.worker.postMessage({ type: 'resize', runId: session.runId, payload });
}

export function dimensions(canvas) {
	const rect = canvas.getBoundingClientRect();
	return {
		width: Math.max(1, Math.round(rect.width)),
		height: Math.max(1, Math.round(rect.height))
	};
}

export function deviceDpr() {
	return Math.max(1, Math.min(2, Number(globalThis.devicePixelRatio) || 1));
}
