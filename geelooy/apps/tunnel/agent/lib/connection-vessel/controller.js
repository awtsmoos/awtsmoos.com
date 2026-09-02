// B"H
// Boruch Hashem
// Blessed is He

const ControllerMailbox = require("./controller-mailbox.js");
const CustodyProgress = require("./controller-custody-progress.js");
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
 * in distinct vessels. Awtsmoos.com mirrors testimony before repair and now returns exact
 * execution progress through supervised IPC without confusing current child with accepter.
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
	const custodyProgress = CustodyProgress.create({ notify });
	const statsPublisher = StatsPublisher.create({ notify, stats: options.stats });

	router = MessageRouter.createMessageRouter({
		enqueueRequest: options.enqueueRequest,
		generation: () => options.state.generation,
		log,
		mirror,
		notify,
		onRecoveryRequired: supervisor.requestRepair,
		onRegistered: supervisor.markRegistered,
		onTerminal: terminal,
		proxy,
		publishStats: statsPublisher.publish
	});

	function connect() {
		options.state.activeWs = proxy;
		supervisor.start();
		return proxy;
	}

	function notify(message) {
		return supervisor.notify(message);
	}

	function mirror(next = {}) {
		return State.mirror(options, proxy, next);
	}

	function terminal(message) {
		supervisor.preventRestart();
		mirror({ connected: false, reason: message.reason, running: false, terminal: true });
		setImmediate(() => {
			(options.exitProcess || process.exit)(Number(message.exitCode || 0));
		});
	}

	function stop() {
		supervisor.stop(Protocol.message(Protocol.TYPES.STOP));
		mirror({ connected: false, running: false });
	}

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
		progressCustody: custodyProgress.progress,
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
