// B"H

/**
 * Delivers control frames immediately and admits work one event-loop turn at a
 * time. A coalesced TCP packet therefore cannot hide its trailing ping behind
 * dozens of filesystem requests.
 */
function createInboundDispatch(deliver, options = {}) {
	const pending = [];
	const setImmediateFn = options.setImmediateFn || setImmediate;
	let scheduled = false;
	let closed = false;

	function accept(raw) {
		if (closed) return false;
		if (!isTunnelRequest(raw)) return deliver(raw);
		pending.push(raw);
		schedule();
		return true;
	}

	function schedule() {
		if (scheduled || closed || !pending.length) return;
		scheduled = true;
		setImmediateFn(drainOne);
	}

	function drainOne() {
		scheduled = false;
		if (closed) return;
		const raw = pending.shift();
		if (raw !== undefined) deliver(raw);
		schedule();
	}

	function close() {
		closed = true;
		pending.length = 0;
	}

	return { accept, close, pending: () => pending.length };
}

function isTunnelRequest(raw) {
	const text = Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw || "");
	return /"type"\s*:\s*"TUNNEL_REQUEST"/.test(text);
}

module.exports = {
	createInboundDispatch,
	isTunnelRequest
};
