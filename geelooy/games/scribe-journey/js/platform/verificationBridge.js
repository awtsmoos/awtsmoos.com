// B"H

function cloneState(state) {
	if (!state) return null;
	return JSON.parse(JSON.stringify(state));
}

/**
 * Exposes deterministic stepping only when the URL explicitly requests
 * verification. Ordinary players receive no debugging surface at all.
 */
export function createVerificationBridge({ dispatch, step }) {
	const enabled = new URLSearchParams(location.search).has('verification');
	let latestState = null;
	if (!enabled) return { capture() {} };

	window.__scribeVerification = {
		dispatch(payload) {
			dispatch(payload);
		},
		step(now) {
			step(now);
		},
		getState() {
			return cloneState(latestState);
		}
	};

	return {
		capture(state) {
			latestState = state;
		}
	};
}
