// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");
const { createFoundation } = require("./child-foundation.js");
const { createDelivery } = require("./child-delivery.js");
const ParentWatchdog = require("./parent-watchdog.js");
const Send = require("../runtime/safe-send.js");

/**
	* @file Coordinates connection lifecycle, IPC state, and recovery transitions.
	* @description
	* The Awtsmoos replays inbox work only when a parent attaches, while socket
	* reconnect resends only completed outbox testimony. One parent sees one ingress.
	*/
function createRuntime() {
	let foundation;
	let delivery;
	let stateTimer = null;
	let wasRegistered = false;
	let terminal = false;
	let parentStats = {};
	const parentWatchdog = ParentWatchdog.create({
		parentPid: process.env.AWTSMOOS_CONNECTION_OWNER_PID
	});

	function send(message) {
		try { process.send?.(message); return true; }
		catch { return false; }
	}

	function stats() {
		return {
			...parentStats,
			connection: snapshot()
		};
	}

	function updateParentStats(next = {}) {
		parentStats = next && typeof next === "object" ? next : {};
		parentWatchdog.pulse(parentStats);
		return stats();
	}

	function exitProcess(code) {
		terminal = true;
		send(Protocol.message(Protocol.TYPES.TERMINAL, {
			exitCode: Number(code || 0),
			reason: foundation?.state?.replacementRequested
				? "newer_connection_owns_tunnel"
				: "connection_child_terminal"
		}));
		setTimeout(() => process.exit(code), 10).unref?.();
	}

	foundation = createFoundation({
		enqueueRequest: (...args) => delivery.enqueueRequest(...args),
		exitProcess,
		stats
	});
	delivery = createDelivery({
		Send,
		mailbox: foundation.mailbox,
		send,
		state: foundation.state
	});

	function start() {
		stateTimer = setInterval(publishState, 500);
		stateTimer.unref?.();
		foundation.connection.connect();
		send(Protocol.message(Protocol.TYPES.READY, { pid: process.pid }));
		return foundation.state;
	}

	function publishState() {
		const registered = foundation.state.registrationConfirmed === true;
		if (registered && !wasRegistered) delivery.flush();
		wasRegistered = registered;
		parentWatchdog.inspect(
			{ registered },
			foundation.mailbox.snapshot()
		);
		send(Protocol.message(Protocol.TYPES.STATE, { state: snapshot() }));
	}

	function snapshot() {
		const state = foundation.state;
		return {
			childPid: process.pid,
			connected: state.activeWs?.opened === true,
			generation: state.generation,
			lastRegisteredAt: state.lastRegisteredAt,
			mailbox: foundation.mailbox.snapshot(),
			parent: parentWatchdog.snapshot(),
			lastFailure: state.lastFailure || null,
			recentFailures: state.recentFailures || [],
			reconnectAttempt: state.reconnectAttempt,
			registered: state.registrationConfirmed === true,
			running: !terminal,
			terminal,
			tunnelId: state.tunnelId,
			tunnelName: state.tunnelName
		};
	}

	function stop() {
		if (stateTimer) clearInterval(stateTimer);
		stateTimer = null;
		foundation.connection.clearReconnectTimer();
		foundation.connection.closeActiveSocket(true);
	}

	return {
		flush: delivery.flush,
		mailbox: foundation.mailbox,
		parentDidBecomeReady: delivery.parentDidBecomeReady,
		redeliver: delivery.redeliver,
		snapshot,
		start,
		stop,
		transmit: delivery.transmit,
		updateParentStats
	};
}

module.exports = { createRuntime };
