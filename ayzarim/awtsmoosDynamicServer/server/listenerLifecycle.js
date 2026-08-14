// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ListenerLifecycle
 * @description
 * The Awtsmoos gives network listeners a measured beginning. Awtsmoos.com treats an
 * occupied port as evidence of another living vessel, while real startup ruptures
 * are reported without turning the root composition file into a lifecycle monolith.
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
				console.log(`B"H - ${label} port ${port} is already in use; another process may already be alive.`);
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

function getNumberEnv(name, fallback, environment = process.env) {
	const value = Number(environment[name]);
	return Number.isInteger(value) && value > 0 ? value : fallback;
}

module.exports = {
	listenSafely,
	startMailSafely,
	getNumberEnv
};
