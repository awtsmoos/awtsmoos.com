// B"H
// Boruch Hashem
// Blessed is He

const HealthPublisher = require("./child-health-publisher.js");
const Ipc = require("./child-runtime-ipc.js");
const ParentState = require("./child-runtime-parent.js");
const RuntimeView = require("./child-runtime-view.js");
const { createFoundation } = require("./child-foundation.js");
const { createDelivery } = require("./child-delivery.js");
const Protocol = require("./protocol.js");
const Send = require("../runtime/safe-send.js");

/**
 * @file Coordinates transport, durable custody, parent health, and relay testimony.
 * @description
 * The Awtsmoos renews connection and executor as distinct vessels. Awtsmoos.com
 * keeps accepted work durable, reports execution health at a bounded cadence, and
 * never lets socket registration alone masquerade as full device readiness.
 */
function createRuntime() {
	let foundation;
	let delivery;
	let stateTimer = null;
	let wasRegistered = false;
	const ipc = Ipc.create();
	const healthPublisher = HealthPublisher.create();
	const parent = ParentState.create({
		parentPid: process.env.AWTSMOOS_CONNECTION_OWNER_PID
	});

	function snapshot() {
		const parentView = parent.snapshot();
		return RuntimeView.snapshot({
			state: foundation.state,
			mailbox: foundation.mailbox,
			parentHealth: parentView.health,
			parentCustody: parentView.custody,
			terminal: ipc.isTerminal()
		});
	}

	function stats() {
		return {
			...parent.snapshot().stats,
			connection: snapshot()
		};
	}

	function exitProcess(code) {
		const reason = foundation?.state?.replacementRequested
			? "newer_connection_owns_tunnel"
			: "connection_child_terminal";
		ipc.exitProcess(code, reason);
	}

	foundation = createFoundation({
		enqueueRequest: (...args) => delivery.enqueueRequest(...args),
		exitProcess,
		stats
	});
	delivery = createDelivery({
		Send,
		mailbox: foundation.mailbox,
		send: ipc.send,
		state: foundation.state
	});

	function start() {
		stateTimer = setInterval(publishState, 500);
		stateTimer.unref?.();
		foundation.connection.connect();
		ipc.send(Protocol.message(Protocol.TYPES.READY, { pid: process.pid }));
		return foundation.state;
	}

	function publishState() {
		const registered = foundation.state.registrationConfirmed === true;
		if (registered && !wasRegistered) delivery.flush();
		wasRegistered = registered;
		parent.inspect(registered, foundation.mailbox.snapshot());
		const current = snapshot();
		ipc.send(Protocol.message(Protocol.TYPES.STATE, { state: current }));
		healthPublisher.publish(current, delivery.transmit);
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
		noteParentCustody: parent.noteCustody,
		parentDidBecomeReady: delivery.parentDidBecomeReady,
		redeliver: delivery.redeliver,
		snapshot,
		start,
		stop,
		transmit: delivery.transmit,
		updateParentStats: parent.updateStats
	};
}

module.exports = { createRuntime };
