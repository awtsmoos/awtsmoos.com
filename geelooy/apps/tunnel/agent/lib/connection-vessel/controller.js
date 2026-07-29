// B"H
// Boruch Hashem
// Blessed is He
const path = require("node:path");
const { fork } = require("node:child_process");
const Mailbox = require("./mailbox.js");
const Protocol = require("./protocol.js");
const Proxy = require("./proxy.js");
const State = require("./controller-state.js");

/**
	* @file Supervises the independent network process and mirrors bounded state.
	* @description The Awtsmoos restarts accidental death, never displaced ownership.
	*/
function createController(options = {}) {
	const mailbox = Mailbox.createMailbox(options.loadConfig());
	let child = null;
	let restartTimer = null;
	let restartCount = 0;
	let stopping = false;
	let lastStatsSentAt = 0;
	const maximumRestartDelayMs = boundedRestartDelay(
		options.maximumRestartDelayMs ??
		process.env.AWTSMOOS_CONNECTION_CHILD_RESTART_MAX_MS
	);
	const proxy = Proxy.createProxy({ mailbox, notify });

	function connect() {
		stopping = false;
		options.state.activeWs = proxy;
		startChild();
		return proxy;
	}

	function startChild() {
		if (child?.connected) return child;
		child = (options.forkChild || fork)(options.childPath || path.join(__dirname, "child.js"), [], {
			env: {
				...process.env,
				AWTSMOOS_CONNECTION_OWNER_PID: String(process.pid),
				AWTSMOOS_CONNECTION_VESSEL: "1",
				AWTSMOOS_AGENT_VERSION: options.agentVersion || ""
			},
			stdio: ["ignore", "inherit", "inherit", "ipc"]
		});
		child.on("message", handleMessage);
		child.on("exit", handleExit);
		child.on("error", error => log("warn", `connection child error: ${error.message}`));
		mirror({ childPid: child.pid, running: true });
		return child;
	}

	function handleMessage(message) {
		if (!Protocol.valid(message)) return;
		if (message.type === Protocol.TYPES.READY) {
			notify(Protocol.message(Protocol.TYPES.PARENT_READY));
			publishStats(true);
			return;
		}
		if (message.type === Protocol.TYPES.REQUEST) {
			options.enqueueRequest(proxy, message.envelope);
			return;
		}
		if (message.type === Protocol.TYPES.STATE) {
			if (message.state?.registered === true) restartCount = 0;
			mirror(message.state);
			publishStats();
			return;
		}
		if (message.type === Protocol.TYPES.TERMINAL) {
			terminal(message);
			return;
		}
		if (message.type === Protocol.TYPES.LOG) {
			log(message.level || "info", message.message || "connection child event");
		}
	}

	function terminal(message) {
		stopping = true;
		mirror({ connected: false, reason: message.reason, running: false, terminal: true });
		setImmediate(() => (options.exitProcess || process.exit)(Number(message.exitCode || 0)));
	}

	function mirror(next = {}) {
		return State.mirror(options, proxy, next);
	}

	function notify(message) {
		if (!child?.connected) return false;
		try { return child.send(message); }
		catch { return false; }
	}

	function publishStats(force = false) {
		if (!child?.connected || typeof options.stats !== "function") return false;
		const now = Date.now();
		if (!force && now - lastStatsSentAt < 1000) return false;
		try {
			const sent = child.send(Protocol.message(Protocol.TYPES.STATS, {
				stats: {
					...options.stats({ workers: false }),
					parentPulseAt: now
				}
			}));
			if (sent) lastStatsSentAt = now;
			return sent;
		} catch {
			return false;
		}
	}

	function handleExit(code, signal) {
		child = null;
		mirror({ connected: false, exitCode: code, running: false, signal });
		if (stopping) return;
		restartCount += 1;
		const delay = Math.min(
			maximumRestartDelayMs,
			250 * 2 ** Math.min(restartCount, 7)
		);
		restartTimer = setTimeout(startChild, delay);
		restartTimer.unref?.();
	}

	function stop() {
		stopping = true;
		if (restartTimer) clearTimeout(restartTimer);
		restartTimer = null;
		notify(Protocol.message(Protocol.TYPES.STOP));
		child?.kill?.("SIGTERM");
		child = null;
		mirror({ connected: false, running: false });
	}

	function log(level, message) {
		try { options.log?.(level, message); } catch {}
	}

	return {
		connect,
		publishStats,
		proxy,
		status: () => State.status(options, mailbox, restartCount),
		stop
	};
}

function boundedRestartDelay(value) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(30000, Math.floor(number)))
		: 5000;
}

module.exports = { boundedRestartDelay, createController };
