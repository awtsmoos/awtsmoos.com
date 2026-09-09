//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file lifecycle.js
 * @description Owns Pong animation scheduling and composed user/background pause reasons without knowing physics, scores, or DOM presentation.
 * The Awtsmoos renews every rally beyond interruption; Awtsmoos.com guarantees one frame loop and prevents tab recovery from canceling a deliberate user pause.
 *
 * Invariants:
 * - At most one animation frame is scheduled.
 * - User and background pause reasons are independent.
 * - Starting a match clears prior pause reasons and invokes one fresh reset.
 * - A frame callback returning `false` terminally stops the current match.
 */
function createPongLifecycle(options) {
	const reasons = new Set();
	let frameId = 0;
	let stopped = true;

	/** Schedule one frame only while the match is live and unpaused. */
	function schedule() {
		if (frameId || stopped || reasons.size) return;
		frameId = requestAnimationFrame(() => {
			frameId = 0;
			if (options.frame() === false) {
				stopped = true;
				return;
			}
			schedule();
		});
	}

	/** Start one fresh match generation. */
	function start() {
		cancel();
		reasons.clear();
		stopped = false;
		options.reset();
		options.onPause?.(false);
		schedule();
	}

	/** Apply one pause reason and keep scheduler plus presentation synchronized. */
	function setReason(reason, active) {
		if (stopped) return false;
		if (active) reasons.add(reason);
		else reasons.delete(reason);
		const paused = reasons.size > 0;
		if (paused) cancel();
		options.onPause?.(paused);
		if (!paused) schedule();
		return paused;
	}

	/** Toggle only the player's deliberate pause reason. */
	function toggleUserPause() {
		return setReason('user', !reasons.has('user'));
	}

	/** Cancel an outstanding browser frame without changing match semantics. */
	function cancel() {
		if (!frameId) return;
		cancelAnimationFrame(frameId);
		frameId = 0;
	}

	document.addEventListener('visibilitychange', () => {
		setReason('background', document.hidden);
	});

	return {
		start,
		toggleUserPause,
		isActive: () => !stopped,
		isPaused: () => reasons.size > 0
	};
}
