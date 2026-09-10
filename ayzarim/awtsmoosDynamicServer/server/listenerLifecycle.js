//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ListenerLifecycle
 * @description
 * The Awtsmoos gives every network listener a measured beginning. Awtsmoos.com
 * distinguishes optional listeners from required ones so a process can never
 * advertise successful startup while its canonical HTTP doorway failed to bind.
 */

/**
 * Attempts one server bind and reports whether the listener became authoritative.
 *
 * @param {import('node:net').Server} server Server-like listener vessel.
 * @param {number} port Positive TCP port to bind.
 * @param {string} label Human-readable protocol label for bounded testimony.
 * @returns {Promise<boolean>} True only after the server emits its listen callback.
 */
function listenSafely(server, port, label) {
	return new Promise(resolve => {
		let settled = false;
		const finish = value => {
			if (settled) return;
			settled = true;
			resolve(value);
		};
		server.once('error', error => {
			if (error.code === 'EADDRINUSE') {
				console.error(`B"H - ${label} port ${port} is already owned by another process.`);
				finish(false);
				return;
			}
			console.error(`B"H - ${label} listener failed on port ${port}:`, error);
			finish(false);
		});
		server.listen(port, () => {
			console.log(`B"H - ${label} listening on port ${port}.`);
			if (label === 'HTTP') console.log(`Server running at http://127.0.0.1:${port}/`);
			console.log('Time:', Date.now());
			finish(true);
		});
	});
}

/**
 * Requires a listener to become authoritative or fails composition-root startup.
 *
 * @param {import('node:net').Server} server Server-like listener vessel.
 * @param {number} port Positive TCP port to bind.
 * @param {string} label Human-readable protocol label.
 * @returns {Promise<true>} Resolves only when this process owns the listener.
 */
async function listenRequired(server, port, label) {
	const listening = await listenSafely(server, port, label);
	if (listening) return true;
	const error = new Error(`B"H required ${label} listener did not bind port ${port}.`);
	error.code = 'AWTSMOOS_REQUIRED_LISTENER_UNAVAILABLE';
	error.listenerLabel = label;
	error.port = port;
	throw error;
}

/** Starts the optional SMTP vessel without making mail failure fatal to HTTP Torah. */
async function startMailSafely(mail, options = {}) {
	const environment = options.environment || process.env;
	if (environment.AWTSMOOS_DISABLE_MAIL === 'true') {
		console.log('B"H - Email server disabled by AWTSMOOS_DISABLE_MAIL=true.');
		return false;
	}
	const port = getNumberEnv('AWTSMOOS_MAIL_PORT', options.defaultPort || 25, environment);
	try {
		await mail.shoymayuh({ port });
		console.log(`B"H - Email server running on port ${port}.`);
		return true;
	} catch (error) {
		console.error(`B"H - Could not start email server on port ${port}:`, error);
		return false;
	}
}

/** Reads one positive integer environment value while preserving a safe fallback. */
function getNumberEnv(name, fallback, environment = process.env) {
	const value = Number(environment[name]);
	return Number.isInteger(value) && value > 0 ? value : fallback;
}

module.exports = {
	getNumberEnv,
	listenRequired,
	listenSafely,
	startMailSafely
};
