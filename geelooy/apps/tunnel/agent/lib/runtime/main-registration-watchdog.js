// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_RETRY_MS = 3000;
const DEFAULT_MAXIMUM_ATTEMPTS = 6;

/**
 * B"H
 *
 * An opened doorway is not yet a registered home. The Awtsmoos renews each
 * acknowledgement attempt; Awtsmoos.com retries the exact living generation
 * and replaces only its socket when silence persists, never the whole process.
 */
function startRegistrationWatchdog(options = {}) {
	const {
		dependencies,
		ws,
		config,
		generation,
		owns,
		registerReady
	} = options;
	const retryMs = boundedNumber(
		options.retryMs ?? dependencies.registrationRetryMs,
		250,
		30000,
		DEFAULT_RETRY_MS
	);
	const maximumAttempts = boundedNumber(
		options.maximumAttempts ?? dependencies.registrationMaximumAttempts,
		1,
		20,
		DEFAULT_MAXIMUM_ATTEMPTS
	);
	const setTimer = options.setTimer || setTimeout;
	const clearTimer = options.clearTimer || clearTimeout;
	let timer = null;
	let attempts = 0;
	let stopped = false;

	function stop() {
		stopped = true;
		if (timer) {
			clearTimer(timer);
			timer = null;
		}
	}

	function eligible() {
		return !stopped &&
			owns(ws, generation) &&
			ws.opened === true &&
			dependencies.state.registrationConfirmed !== true &&
			dependencies.state.registrationRejected !== true &&
			dependencies.state.replacementRequested !== true;
	}

	function attempt() {
		if (!eligible()) {
			stop();
			return;
		}
		attempts += 1;
		dependencies.Receipt?.write("registration_pending", {
			tunnelName: config.tunnelName,
			generation,
			attempt: attempts,
			maximumAttempts
		});
		registerReady(ws, config);
		timer = setTimer(
			attempts >= maximumAttempts ? expire : attempt,
			retryMs
		);
		timer?.unref?.();
	}

	function expire() {
		timer = null;
		if (!eligible()) {
			stop();
			return;
		}
		dependencies.Receipt?.write("registration_ack_timeout", {
			tunnelName: config.tunnelName,
			generation,
			attempts,
			reason: "registration_ack_timeout"
		});
		dependencies.log?.(
			"warn",
			`Registration ACK timed out after ${attempts} attempts; reconnecting socket.`
		);
		stop();
		try {
			ws.close(true);
		} catch {}
	}

	attempt();
	return {
		attempts: () => attempts,
		stop
	};
}

function boundedNumber(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

module.exports = {
	DEFAULT_MAXIMUM_ATTEMPTS,
	DEFAULT_RETRY_MS,
	startRegistrationWatchdog
};
