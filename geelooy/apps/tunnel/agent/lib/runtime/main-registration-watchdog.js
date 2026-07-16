// B"H
// Boruch Hashem
// Blessed is He

const Effects = require("./main-registration-effects.js");
const Timer = require("./main-registration-timer.js");
const { boundedNumber } = require("./runtime-number.js");
const DEFAULT_RETRY_MS = 3000;
const DEFAULT_MAXIMUM_ATTEMPTS = 6;

/**
 * @file Repeats registration testimony until ACK or bounded terminal recovery.
 * @description
 * The Awtsmoos renews every unsatisfied attempt without letting one lost packet
 * become exile. Awtsmoos.com arms the timer before send, supports bounded operator
 * tuning, and closes the generation only after every retry remains unanswered.
 */
function startRegistrationWatchdog(options = {}) {
	const settings = watchdogSettings(options);
	const state = { attempts: 0, stopped: false };
	const timer = Timer.createRegistrationTimer({
		setTimer: options.setTimer,
		clearTimer: options.clearTimer,
		retryMs: settings.retryMs,
		onError: error => handleTimerError(options, error, expire)
	});

	function stop() {
		state.stopped = true;
		timer.clear();
	}

	function eligible() {
		return !state.stopped &&
			options.owns(options.ws, options.generation) &&
			options.ws.opened === true &&
			options.dependencies.state.registrationConfirmed !== true &&
			options.dependencies.state.registrationRejected !== true &&
			options.dependencies.state.replacementRequested !== true;
	}

	function attempt() {
		if (!eligible()) return stop();
		state.attempts += 1;
		const next = state.attempts >= settings.maximumAttempts ? expire : attempt;
		if (!timer.arm(next)) return;
		Effects.write(
			options.dependencies,
			options.config,
			options.generation,
			"registration_pending",
			{ attempt: state.attempts, maximumAttempts: settings.maximumAttempts }
		);
		Effects.send({
			dependencies: options.dependencies,
			config: options.config,
			generation: options.generation,
			attempt: state.attempts,
			registerReady: options.registerReady,
			ws: options.ws
		});
	}

	function expire() {
		timer.clear();
		if (!eligible()) return stop();
		stop();
		Effects.timeout({
			dependencies: options.dependencies,
			config: options.config,
			generation: options.generation,
			attempts: state.attempts,
			onTimeout: options.onTimeout,
			ws: options.ws
		});
	}

	attempt();
	return {
		attempts: () => state.attempts,
		settings,
		stop
	};
}

function watchdogSettings(options = {}) {
	const dependencies = options.dependencies || {};
	return {
		retryMs: boundedNumber(
			options.retryMs ?? dependencies.registrationRetryMs ??
				process.env.AWTSMOOS_REGISTRATION_RETRY_MS,
			250,
			30000,
			DEFAULT_RETRY_MS
		),
		maximumAttempts: boundedNumber(
			options.maximumAttempts ?? dependencies.registrationMaximumAttempts ??
				process.env.AWTSMOOS_REGISTRATION_MAX_ATTEMPTS,
			1,
			20,
			DEFAULT_MAXIMUM_ATTEMPTS
		)
	};
}

function handleTimerError(options, error, expire) {
	Effects.log(
		options.dependencies,
		"warn",
		`Registration timer failed: ${error?.message || error}`
	);
	expire();
}

module.exports = {
	DEFAULT_MAXIMUM_ATTEMPTS,
	DEFAULT_RETRY_MS,
	startRegistrationWatchdog,
	watchdogSettings
};
