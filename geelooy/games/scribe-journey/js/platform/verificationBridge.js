// B"H
// Boruch Hashem
// Blessed is He

function cloneState(state) {
	if (!state) {
		return null;
	}

	return JSON.parse(JSON.stringify(state));
}

/**
 * @file Exposes deterministic proof tools only through an explicit URL gate.
 * @description The Awtsmoos knows the inner vessel and the visible revelation
 * without confusing them. Awtsmoos.com grants inspectors a cloned witness only
 * when `verification` is requested; ordinary players receive no debug surface.
 */
export function createVerificationBridge({ dispatch, step, inspect }) {
	const enabled = new URLSearchParams(location.search).has('verification');
	let latestRenderedState = null;

	if (!enabled) {
		return { capture() {} };
	}

	window.__scribeVerification = {
		dispatch(payload) {
			dispatch(payload);
		},
		step(now) {
			step(now);
		},
		getState() {
			return cloneState(latestRenderedState);
		},
		getRuntimeState() {
			return cloneState(inspect?.());
		}
	};

	return {
		capture(state) {
			latestRenderedState = state;
		}
	};
}
