// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Registration diagnostics may fail without becoming connection policy. The
 * Awtsmoos renews receipt, log, send, and timeout; Awtsmoos.com contains every
 * synchronous side-effect failure while bounded recovery continues unchanged.
 */
function write(dependencies, config, generation, type, details = {}) {
	try {
		dependencies.Receipt?.write(type, {
			tunnelName: config.tunnelName,
			generation,
			...details
		});
		return true;
	} catch (error) {
		log(
			dependencies,
			"warn",
			`Registration receipt failed: ${error?.message || error}`
		);
		return false;
	}
}

function send(options = {}) {
	const {
		dependencies,
		config,
		generation,
		attempt,
		registerReady,
		ws
	} = options;
	try {
		registerReady(ws, config);
		return true;
	} catch (error) {
		write(dependencies, config, generation, "registration_send_error", {
			attempt,
			reason: error?.message || "registration_send_error"
		});
		log(
			dependencies,
			"warn",
			`Registration send attempt ${attempt} failed: ${error?.message || error}`
		);
		return false;
	}
}

function timeout(options = {}) {
	const {
		dependencies,
		config,
		generation,
		attempts,
		onTimeout,
		ws
	} = options;
	write(dependencies, config, generation, "registration_ack_timeout", {
		attempts,
		reason: "registration_ack_timeout"
	});
	log(
		dependencies,
		"warn",
		`Registration ACK timed out after ${attempts} attempts.`
	);
	if (typeof onTimeout === "function") {
		onTimeout({ attempts, generation, ws });
		return;
	}
	try {
		ws.close(true);
	} catch {}
}

function log(dependencies, level, message) {
	try {
		dependencies.log?.(level, message);
		return true;
	} catch {
		return false;
	}
}

module.exports = {
	log,
	send,
	timeout,
	write
};
