//B"H
// Boruch Hashem
// Blessed is He

const HealthPublisher = require("./child-health-publisher.js");
const Ipc = require("./child-runtime-ipc.js");
const ParentState = require("./child-runtime-parent.js");
const RuntimeCustody = require("./child-runtime-custody.js");
const RuntimeCycle = require("./child-runtime-cycle.js");
const RuntimeView = require("./child-runtime-view.js");
const { createFoundation } = require("./child-foundation.js");
const { createDelivery } = require("./child-delivery.js");
const Protocol = require("./protocol.js");
const Send = require("../runtime/safe-send.js");
/**
 * @file Composes transport, durable custody, parent health, and relay testimony.
 * @description
 * The Awtsmoos renews each request and generation across socket and process vessels.
 * Awtsmoos.com keeps composition here while smaller custody and cycle vessels guard the
 * exact deed, so runtime life remains readable and expandable without a monolithic veil.
 */
function createRuntime() {
	let foundation;
	let delivery;
	let stateTimer = null;
	const ipc = Ipc.create();
	const healthPublisher = HealthPublisher.create();
	const parent = ParentState.create({
		parentPid: process.env.AWTSMOOS_CONNECTION_OWNER_PID,
		getGeneration: () => foundation?.state?.generation || 0
	});
	let cycle;
	let custody;

	/** Returns the parent-visible transport and mailbox state without mutation. */
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

	/** Returns bounded parent scheduler statistics plus current connection testimony. */
	function stats() {
		return {
			...parent.snapshot().stats,
			connection: snapshot()
		};
	}

	/** Converts a child-terminal path into the correct supervised process exit reason. */
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
	custody = RuntimeCustody.createCustody({
		mailbox: foundation.mailbox,
		parent,
		state: foundation.state
	});
	cycle = RuntimeCycle.createCycle({
		delivery,
		healthPublisher,
		ipc,
		mailbox: foundation.mailbox,
		parent,
		snapshot,
		state: foundation.state
	});

	/** Starts the connection transport and periodic healing/publication cycle. */
	function start() {
		stateTimer = setInterval(cycle.publish, 500);
		stateTimer.unref?.();
		foundation.connection.connect();
		ipc.send(Protocol.message(Protocol.TYPES.READY, { pid: process.pid }));
		return foundation.state;
	}

	/** Stops this child timer, reconnect timer, and active transport without touching parent. */
	function stop() {
		if (stateTimer) clearInterval(stateTimer);
		stateTimer = null;
		foundation.connection.clearReconnectTimer();
		foundation.connection.closeActiveSocket(true);
	}

	return {
		flush: delivery.flush,
		mailbox: foundation.mailbox,
		noteParentCustody: custody.noteParentCustody,
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
