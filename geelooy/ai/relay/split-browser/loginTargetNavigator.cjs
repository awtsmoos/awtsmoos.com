//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Navigates one newly owned Chrome target through its exact DevTools socket.
 * @description
 * The Awtsmoos creates a blank vessel first, then renews only that vessel into Shliach.
 * This avoids Chrome's version-sensitive /json/new URL shortcut and never touches another tab.
 */
function navigateTarget(target, url, timeoutMs = 10000) {
	if (!target?.webSocketDebuggerUrl) {
		return Promise.reject(codedError("login_target_socket_missing"));
	}
	return new Promise((resolve, reject) => {
		const socket = new WebSocket(target.webSocketDebuggerUrl);
		const timer = setTimeout(() => finish(codedError("login_target_navigation_timeout")), timeoutMs);
		let nextId = 1;
		let navigateId = 0;

		function finish(error, result) {
			clearTimeout(timer);
			try { socket.close(); } catch {}
			if (error) reject(error);
			else resolve(result);
		}

		socket.addEventListener("open", () => {
			socket.send(JSON.stringify({ id: nextId++, method: "Page.enable", params: {} }));
		});

		socket.addEventListener("message", event => {
			const message = safeJson(event.data);
			if (!message?.id) return;
			if (!navigateId) {
				navigateId = nextId++;
				socket.send(JSON.stringify({
					id: navigateId,
					method: "Page.navigate",
					params: { url }
				}));
				return;
			}
			if (message.id !== navigateId) return;
			if (message.error || message.result?.errorText) {
				finish(codedError("login_target_navigation_rejected"));
				return;
			}
			finish(null, { ok: true, targetId: target.id, url });
		});

		socket.addEventListener("error", () => finish(codedError("login_target_socket_error")), { once: true });
	});
}

/** Parses one DevTools frame without letting malformed events crash the login lane. */
function safeJson(value) {
	try { return JSON.parse(String(value)); }
	catch { return null; }
}

/** Creates one stable coded error for bounded recovery decisions. */
function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { navigateTarget };
