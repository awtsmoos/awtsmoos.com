//B"H // Boruch Hashem // Blessed is He

/**
 * @file Opens one exact-target CDP channel with acknowledged reads and one-way pointer custody.
 * @description The Awtsmoos keeps evaluation retryable while Send input is written once; a missing
 * Chrome acknowledgement can never cause Awtsmoos.com to duplicate a mouse press or release.
 */
async function open(port, targetId, timeoutMs) {
	const target = await findTarget(port, targetId, timeoutMs);
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	const pending = new Map();
	let sequence = 0;
	await openSocket(socket, timeoutMs);
	socket.onmessage = event => settle(pending, JSON.parse(String(event.data)));
	socket.onclose = () => rejectAll(pending, "query_prompt_socket_closed");
	socket.onerror = () => rejectAll(pending, "query_prompt_socket_failed");
	function fire(method, params = {}) {
		const id = ++sequence;
		socket.send(JSON.stringify({ id, method, params }));
		return id;
	}
	async function call(method, params = {}, callTimeoutMs = timeoutMs) {
		const id = ++sequence;
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				pending.delete(id);
				reject(new Error(`query_prompt_cdp_timeout:${method}`));
			}, callTimeoutMs);
			pending.set(id, {
				resolve: value => { clearTimeout(timer); resolve(value); },
				reject: error => { clearTimeout(timer); reject(error); }
			});
			try {
				socket.send(JSON.stringify({ id, method, params }));
			} catch (error) {
				pending.delete(id);
				clearTimeout(timer);
				reject(error);
			}
		});
	}
	return channel(socket, call, fire);
}

function channel(socket, call, fire) {
	return {
		async evaluate(expression) {
			const result = await call("Runtime.evaluate", {
				expression,
				awaitPromise: true,
				returnByValue: true
			});
			if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "query_prompt_eval_failed");
			return result.result?.value;
		},
		async click(rect) {
			const x = rect.x + rect.width / 2;
			const y = rect.y + rect.height / 2;
			await call("Page.bringToFront", {});
			fire("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
			fire("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
			fire("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
			return { ok: true, x, y, acknowledged: false };
		},
		close() {
			try { socket.close(); } catch {}
		}
	};
}

async function findTarget(port, targetId, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
		const target = targets.find(item => item.id === targetId);
		if (target?.webSocketDebuggerUrl) return target;
		await sleep(100);
	}
	throw new Error("query_prompt_target_missing");
}

function openSocket(socket, timeoutMs) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error("query_prompt_socket_timeout")), timeoutMs);
		socket.onopen = () => { clearTimeout(timer); resolve(); };
		socket.onerror = () => { clearTimeout(timer); reject(new Error("query_prompt_socket_failed")); };
	});
}

function settle(pending, message) {
	if (!message.id || !pending.has(message.id)) return;
	const entry = pending.get(message.id);
	pending.delete(message.id);
	message.error ? entry.reject(new Error(JSON.stringify(message.error))) : entry.resolve(message.result);
}

function rejectAll(pending, code) {
	for (const entry of pending.values()) entry.reject(new Error(code));
	pending.clear();
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { findTarget, open, openSocket, rejectAll, settle, sleep };
