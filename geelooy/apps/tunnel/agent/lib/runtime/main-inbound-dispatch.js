// B"H

/**
 * Do not let a packet containing dozens of long-poll waits hide a later
 * commandStatus, output-page or recovery observation. Mutations remain a
 * strict ordering barrier, and a regular request receives a turn for every
 * four privileged observations so bulk cannot starve forever.
 */
const FAST_ACTIONS = new Set([
	'commandStatus', 'commandJobStatus', 'commandPoll',
	'commandJobOutputPage', 'commandOutputPage', 'commandJobCancel',
	'agentStatus', 'tunnelStatus', 'schedulerStatus', 'connectionMailboxStatus',
	'retryAction', 'tunnelRequestPending'
]);
const NON_BARRIER_ACTIONS = new Set([
	'commandWait', 'commandJobWait', 'waitForJob', 'jobWait',
	'commandStatus', 'commandJobStatus', 'commandPoll',
	'commandJobOutputPage', 'commandOutputPage',
	'agentStatus', 'tunnelStatus', 'schedulerStatus', 'connectionMailboxStatus'
]);

function createInboundDispatch(deliver, options = {}) {
	const pending = [];
	const setImmediateFn = options.setImmediateFn || setImmediate;
	let scheduled = false;
	let closed = false;
	let fastStreak = 0;

	function accept(raw) {
		if (closed) return false;
		if (!isTunnelRequest(raw)) return deliver(raw);
		pending.push({ raw, ...classify(raw) });
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
		let selected = 0;
		if (fastStreak < 4) {
			// Only bypass preceding waits and read-only observations. An earlier
			// accepted mutation is a hard ordering fence, even for fast status.
			for (let i = 1; i < pending.length; i++) {
				if (pending[i - 1].barrier) break;
				if (pending[i].fast) { selected = i; break; }
			}
		}
		const [next] = pending.splice(selected, 1);
		if (next) {
			fastStreak = selected > 0 ? fastStreak + 1 : 0;
			deliver(next.raw);
		}
		schedule();
	}

	function close() {
		closed = true;
		pending.length = 0;
	}

	return { accept, close, pending: () => pending.length };
}

function classify(raw) {
	try {
		// Large bulk frames should not need a second JSON parse on ingress.
		if ((Buffer.isBuffer(raw) ? raw.length : String(raw).length) > 32768) {
			return { fast: false, barrier: true };
		}
		const payload = JSON.parse(String(raw))?.payload || {};
		const action = String(payload.action || '');
		return { fast: FAST_ACTIONS.has(action), barrier: !NON_BARRIER_ACTIONS.has(action) };
	} catch {
		return { fast: false, barrier: true };
	}
}

function isTunnelRequest(raw) {
	const text = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw || '');
	return /"type"\s*:\s*"TUNNEL_REQUEST"/.test(text);
}

module.exports = { createInboundDispatch, isTunnelRequest, classify };
