// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Registration timing is one small replaceable vessel. The Awtsmoos renews
 * callback and delay; Awtsmoos.com exposes explicit arm and clear operations so
 * timer failure becomes policy input instead of silently destroying recovery.
 */
function createRegistrationTimer(options = {}) {
	const setTimer = options.setTimer || setTimeout;
	const clearTimer = options.clearTimer || clearTimeout;
	const retryMs = Number(options.retryMs || 0);
	const onError = options.onError || (() => {});
	let timer = null;

	function arm(callback) {
		clear();
		try {
			timer = setTimer(callback, retryMs);
			timer?.unref?.();
			return true;
		} catch (error) {
			timer = null;
			onError(error);
			return false;
		}
	}

	function clear() {
		if (!timer) {
			return;
		}
		clearTimer(timer);
		timer = null;
	}

	return {
		arm,
		clear
	};
}

module.exports = {
	createRegistrationTimer
};
