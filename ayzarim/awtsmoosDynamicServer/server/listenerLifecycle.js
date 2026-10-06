//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ListenerLifecycle
 * @description
 * The Awtsmoos gives every network listener a measured beginning. Awtsmoos.com
 * distinguishes optional listeners from required ones and may inherit the canonical
 * HTTP doorway from systemd so process replacement never tears down port 8080.
 */

const SYSTEMD_FIRST_FD = 3;

/**
 * Attempts one server bind and reports whether the listener became authoritative.
 * Production may inherit fd 3 from systemd socket activation; ordinary runtimes
 * continue to bind the requested TCP port directly.
 */
function listenSafely(server, port, label, options = {}) {
	return new Promise(resolve => {
		let settled = false;
		const finish = value => {
			if (settled) return;
			settled = true;
			resolve(value);
		};
		server.once("error", error => {
			if (error.code === "EADDRINUSE") {
				console.error(`B"H - ${label} port ${port} is already owned by another process.`);
				finish(false);
				return;
			}
			console.error(`B"H - ${label} listener failed on port ${port}:`, error);
			finish(false);
		});
		const inheritedFd = label === "HTTP"
			? systemdSocketFd(options.environment || process.env, options.pid || process.pid)
			: null;
		const listenTarget = inheritedFd === null ? port : { fd: inheritedFd };
		server.listen(listenTarget, () => {
			const vessel = inheritedFd === null ? `port ${port}` : `systemd fd ${inheritedFd}`;
			console.log(`B"H - ${label} listening on ${vessel}.`);
			if (label === "HTTP") console.log(`Server running at http://127.0.0.1:${port}/`);
			console.log("Time:", Date.now());
			finish(true);
		});
	});
}

/** Returns fd 3 only for a valid systemd activation addressed to this exact process. */
function systemdSocketFd(environment = process.env, pid = process.pid) {
	const listenPid = Number(environment.LISTEN_PID || 0);
	const listenFds = Number(environment.LISTEN_FDS || 0);
	if (listenPid !== Number(pid) || !Number.isInteger(listenFds) || listenFds < 1) {
		return null;
	}
	return SYSTEMD_FIRST_FD;
}

/** Requires a listener to become authoritative or fails composition-root startup. */
async function listenRequired(server, port, label, options = {}) {
	const listening = await listenSafely(server, port, label, options);
	if (listening) return true;
	const error = new Error(`B"H required ${label} listener did not bind port ${port}.`);
	error.code = "AWTSMOOS_REQUIRED_LISTENER_UNAVAILABLE";
	error.listenerLabel = label;
	error.port = port;
	throw error;
}

/** Starts the optional SMTP vessel without making mail failure fatal to HTTP Torah. */
async function startMailSafely(mail, options = {}) {
	const environment = options.environment || process.env;
	if (environment.AWTSMOOS_DISABLE_MAIL === "true") {
		console.log('B"H - Email server disabled by AWTSMOOS_DISABLE_MAIL=true.');
		return false;
	}
	const port = getNumberEnv("AWTSMOOS_MAIL_PORT", options.defaultPort || 25, environment);
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
	startMailSafely,
	systemdSocketFd
};
