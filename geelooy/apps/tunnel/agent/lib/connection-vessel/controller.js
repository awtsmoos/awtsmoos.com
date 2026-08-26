// B"H
// Boruch Hashem
// Blessed is He

const ControllerMailbox = require("./controller-mailbox.js");
const MessageRouter = require("./controller-message-router.js");
const ProcessSupervisor = require("./controller-process.js");
const Protocol = require("./protocol.js");
const Proxy = require("./proxy.js");
const State = require("./controller-state.js");

/**
 * @file Composes durable mailbox custody with independently supervised connection life.
 * @description
 * The Awtsmoos keeps socket breath, child liveness, execution custody, and parent state
 * in distinct vessels. Awtsmoos.com exposes each bounded witness so repair can name
 * exactly which generation is silent instead of collapsing everything into connected.
 */
function createController(options = {}) {
	const mailbox = ControllerMailbox.create(options);
	let lastStatsSentAt = 0;
	let router = null;
	const proxy = Proxy.createProxy({ mailbox, notify });
	const supervisor = ProcessSupervisor.createProcessSupervisor({
		agentVersion: options.agentVersion,
		childPath: options.childPath,
		forkChild: options.forkChild,
		handleMessage: message => router?.handle(message),
		log,
		maximumRestartDelayMs: options.maximumRestartDelayMs,
		mirror,
		childLivenessOptions: options.childLivenessOptions,
		childRepairOptions: options.childRepairOptions
	});

	router = MessageRouter.createMessageRouter({
		enqueueRequest: options.enqueueRequest,
		log,
		mirror,
		notify,
		onRegistered: supervisor.markRegistered,
		onTerminal: terminal,
		proxy,
		publishStats
	});

	/** Starts the independently supervised connection child and returns its proxy. */
	function connect() {
		options.state.activeWs = proxy;
		supervisor.start();
		return proxy;
	}

	/** Sends one IPC message through the exact currently supervised child. */
	function notify(message) {
		return supervisor.notify(message);
	}

	/** Mirrors one child state update into the parent-visible execution state. */
	function mirror(next = {}) {
		return State.mirror(options, proxy, next);
	}

	/** Publishes bounded parent scheduler stats to the child at most once per second. */
	function publishStats(force = false) {
		if (typeof options.stats !== "function") return false;
		const now = Date.now();
		if (!force && now - lastStatsSentAt < 1000) return false;
		const sent = notify(Protocol.message(Protocol.TYPES.STATS, {
			stats: {
				...options.stats({ workers: false }),
				parentPulseAt: now
			}
		}));
		if (sent) lastStatsSentAt = now;
		return sent;
	}

	/** Honors a terminal child directive and prevents supervision from resurrecting it. */
	function terminal(message) {
		supervisor.preventRestart();
		mirror({
			connected: false,
			reason: message.reason,
			running: false,
			terminal: true
		});
		setImmediate(() => {
			(options.exitProcess || process.exit)(Number(message.exitCode || 0));
		});
	}

	/** Stops only this controller's connection child and restart machinery. */
	function stop() {
		supervisor.stop(Protocol.message(Protocol.TYPES.STOP));
		mirror({ connected: false, running: false });
	}

	/** Returns transport/mailbox state plus the parent-side child-liveness watchdog. */
	function status() {
		return {
			...State.status(options, mailbox, supervisor.restartCount()),
			childLiveness: supervisor.livenessStatus()
		};
	}

	function log(level, message) {
		try {
			options.log?.(level, message);
		} catch {
			return false;
		}
		return true;
	}

	return {
		connect,
		publishStats,
		proxy,
		status,
		stop
	};
}

module.exports = {
	boundedRestartDelay: ProcessSupervisor.boundedRestartDelay,
	createController
};
