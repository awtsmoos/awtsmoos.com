// B"H
// Boruch Hashem
// Blessed is He

const ControllerMailbox = require("./controller-mailbox.js");
const MessageRouter = require("./controller-message-router.js");
const ProcessSupervisor = require("./controller-process.js");
const Protocol = require("./protocol.js");
const Proxy = require("./proxy.js");
const State = require("./controller-state.js");
const StatsPublisher = require("./controller-stats-publisher.js");

/**
 * @file Composes durable custody with independently supervised connection life.
 * @description
 * The Awtsmoos keeps socket breath, execution custody, child recovery, and parent state
 * in distinct vessels. Awtsmoos.com mirrors testimony before repair and delegates only
 * explicit child ambiguity to the exact process supervisor, never to a broad watchdog.
 */
function createController(options = {}) {
	const mailbox = ControllerMailbox.create(options);
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
	const statsPublisher = StatsPublisher.create({
		notify,
		stats: options.stats
	});

	router = MessageRouter.createMessageRouter({
		enqueueRequest: options.enqueueRequest,
		log,
		mirror,
		notify,
		onRecoveryRequired: supervisor.requestRepair,
		onRegistered: supervisor.markRegistered,
		onTerminal: terminal,
		proxy,
		publishStats: statsPublisher.publish
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

	/** Mirrors one child state update into parent-visible execution state. */
	function mirror(next = {}) {
		return State.mirror(options, proxy, next);
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

	/** Returns transport/mailbox state plus exact child liveness/repair testimony. */
	function status() {
		return {
			...State.status(options, mailbox, supervisor.restartCount()),
			childLiveness: supervisor.livenessStatus()
		};
	}

	/** Emits bounded controller diagnostics without allowing logging failure to break IPC. */
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
		publishStats: statsPublisher.publish,
		proxy,
		status,
		stop
	};
}

module.exports = {
	boundedRestartDelay: ProcessSupervisor.boundedRestartDelay,
	createController
};
