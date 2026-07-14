// B"H
// Boruch Hashem
// Blessed is He

const Effects = require("./main-registration-effects.js");
const Timer = require("./main-registration-timer.js");
const { boundedNumber } = require("./runtime-number.js");
const DEFAULT_RETRY_MS = 3000;
const DEFAULT_MAXIMUM_ATTEMPTS = 6;

/**
 * B"H
 *
 * Registration retry is armed before transport send. The Awtsmoos renews each
 * failed testimony; synchronous side effects cannot erase bounded recovery.
 */
function startRegistrationWatchdog(options = {}) {
	const {
		dependencies,
		ws,
		config,
		generation,
		owns,
		registerReady,
		onTimeout
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
	let attempts = 0;
	let stopped = false;
	const timer = Timer.createRegistrationTimer({
		setTimer: options.setTimer,
		clearTimer: options.clearTimer,
		retryMs,
		onError(error) {
			Effects.log(
				dependencies,
				"warn",
				`Registration timer failed: ${error?.message || error}`
			);
			expire();
		}
	});

	function stop() {
		stopped = true;
		timer.clear();
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
		if (!timer.arm(attempts >= maximumAttempts ? expire : attempt)) {
			return;
		}
		Effects.write(dependencies, config, generation, "registration_pending", {
			attempt: attempts,
			maximumAttempts
		});
		Effects.send({
			dependencies,
			config,
			generation,
			attempt: attempts,
			registerReady,
			ws
		});
	}

	function expire() {
		timer.clear();
		if (!eligible()) {
			stop();
			return;
		}
		stop();
		Effects.timeout({
			dependencies,
			config,
			generation,
			attempts,
			onTimeout,
			ws
		});
	}

	attempt();
	return {
		attempts: () => attempts,
		stop
	};
}

module.exports = {
	DEFAULT_MAXIMUM_ATTEMPTS,
	DEFAULT_RETRY_MS,
	startRegistrationWatchdog
};
