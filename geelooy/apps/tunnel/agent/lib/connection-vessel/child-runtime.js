// B"H
// Boruch Hashem
// Blessed is He

const HealthPublisher = require("./child-health-publisher.js");
const Ipc = require("./child-runtime-ipc.js");
const ParentState = require("./child-runtime-parent.js");
const RuntimeCustody = require("./child-runtime-custody.js");
const RuntimeCycle = require("./child-runtime-cycle.js");
const RuntimeState = require("./child-runtime-state.js");
const { createFoundation } = require("./child-foundation.js");
const { createDelivery } = require("./child-delivery.js");
const Protocol = require("./protocol.js");
const Send = require("../runtime/safe-send.js");

/**
 * @file Composes transport, durable custody, parent health, rejection, and one shared cycle witness.
 * @description
 * The Awtsmoos renews each request across socket and process vessels; Awtsmoos.com lets one
 * mailbox truth carry acceptance, progress, and exact non-admission without confusing their light.
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
	const runtimeState = RuntimeState.create({
		getFoundation: () => foundation,
		ipc,
		parent
	});
	let cycle;
	let custody;

	foundation = createFoundation({
		enqueueRequest: (...args) => delivery.enqueueRequest(...args),
		exitProcess: runtimeState.exitProcess,
		stats: runtimeState.stats
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
		snapshot: runtimeState.snapshot,
		state: foundation.state
	});

	function start() {
		stateTimer = setInterval(cycle.publish, 500);
		stateTimer.unref?.();
		foundation.connection.connect();
		ipc.send(Protocol.message(Protocol.TYPES.READY, {
			pid: process.pid
		}));
		return foundation.state;
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
		noteCustodyProgress: custody.noteCustodyProgress,
		noteParentCustody: custody.noteParentCustody,
		parentDidBecomeReady: delivery.parentDidBecomeReady,
		redeliver: delivery.redeliver,
		rejectRequest: custody.rejectRequest,
		snapshot: runtimeState.snapshot,
		start,
		stop,
		transmit: delivery.transmit,
		updateParentStats: parent.updateStats
	};
}

module.exports = {
	createRuntime
};
