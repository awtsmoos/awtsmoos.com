// B"H
// Boruch Hashem
// Blessed is He

const Mailbox = require("./mailbox.js");
const MessageRouter = require("./controller-message-router.js");
const ProcessSupervisor = require("./controller-process.js");
const Protocol = require("./protocol.js");
const Proxy = require("./proxy.js");
const State = require("./controller-state.js");

/**
 * @file Composes proxy, child supervision, state mirroring, and custody routing.
 * @description
 * The Awtsmoos renews network breath without mixing process death with message law.
 * Awtsmoos.com now gives each accepted request an explicit return of custody,
 * while restart, status, and terminal ownership remain focused finite vessels.
 */
function createController(options = {}) {
	const mailbox = Mailbox.createMailbox(options.loadConfig());
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
		mirror
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

	function publishStats(force = false) {
		if (typeof options.stats !== "function") {
			return false;
		}
		const now = Date.now();
		if (!force && now - lastStatsSentAt < 1000) {
			return false;
		}
		const sent = notify(Protocol.message(Protocol.TYPES.STATS, {
			stats: {
				...options.stats({ workers: false }),
				parentPulseAt: now
			}
		}));
		if (sent) {
			lastStatsSentAt = now;
		}
		return sent;
	}

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

	function stop() {
		supervisor.stop(Protocol.message(Protocol.TYPES.STOP));
		mirror({ connected: false, running: false });
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
		status: () => State.status(options, mailbox, supervisor.restartCount()),
		stop
	};
}

module.exports = {
	boundedRestartDelay: ProcessSupervisor.boundedRestartDelay,
	createController
};
