// B"H
// Boruch Hashem
// Blessed is He

const ChildBirth = require("./controller-child-birth.js");
const ChildLiveness = require("./controller-child-liveness.js");
const ChildRepair = require("./controller-child-repair.js");
const ChildSource = require("./controller-child-source.js");
const Config = require("./controller-process-config.js");
const IncarnationRepair = require("./controller-incarnation-repair.js");
const Lifecycle = require("./controller-process-lifecycle.js");
const Restart = require("./controller-process-restart.js");
const Watchdog = require("./controller-process-watchdog.js");
/**
 * @file Owns connection-child birth, exact repair, and incarnation authority.
 * @description
 * The Awtsmoos recreates the messenger without confusing an old voice with a new life.
 * Awtsmoos.com gives sibling vessels source fencing, repair authority, and shutdown law,
 * while this supervisor keeps one readable covenant for birth, exit, restart, and custody.
 */
function createProcessSupervisor(options = {}) {
	let child = null;
	let childIncarnationId = "";
	const liveness = options.liveness || ChildLiveness.create(options.childLivenessOptions);
	const repair = options.repair || ChildRepair.create({
		getChild: () => child,
		log: options.log,
		...(options.childRepairOptions || {})
	});
	const restart = Restart.create({
		maximumDelayMs: Config.maximumRestartDelay(options),
		start
	});
	let lifecycle = null;
	const watchdog = Watchdog.create({
		getChild: () => child,
		isStopping: () => lifecycle?.isStopping?.() === true,
		liveness,
		repair
	});
	lifecycle = Lifecycle.create({
		clearChild,
		getChild: () => child,
		notify,
		repair,
		restart,
		watchdog
	});
	const source = ChildSource.create({
		getChild: () => child,
		getChildIncarnationId: () => childIncarnationId,
		handleMessage: options.handleMessage,
		liveness,
		log: options.log
	});
	const incarnationRepair = IncarnationRepair.create({
		getChildIncarnationId: () => childIncarnationId,
		isStopping: lifecycle.isStopping,
		repair
	});
	/** Forks one exact child and binds all callbacks to that immutable incarnation. */
	function start() {
		lifecycle.begin();
		if (child?.connected) return child;
		const birth = ChildBirth.spawn(options);
		child = birth.child;
		childIncarnationId = birth.childIncarnationId;
		liveness.started();
		source.bind(child, childIncarnationId, handleExit);
		options.mirror({ childIncarnationId, childPid: child.pid, running: true });
		watchdog.start();
		return child;
	}
	/** Sends one IPC message only to the exact currently connected child. */
	function notify(message) {
		if (!child?.connected) return false;
		try {
			return child.send(message);
		} catch {
			return false;
		}
	}
	/** Reaps only the incarnation that actually emitted this exit event. */
	function handleExit(exitedChild, exitedIncarnationId, code, signal) {
		if (!source.owns(exitedChild, exitedIncarnationId)) return;
		repair.clear(Number(exitedChild?.pid || 0));
		clearChild();
		options.mirror({
			childIncarnationId: "",
			connected: false,
			exitCode: code,
			running: false,
			signal
		});
		if (!lifecycle.isStopping()) restart.schedule();
	}
	function clearChild() {
		child = null;
		childIncarnationId = "";
	}
	return {
		livenessStatus: () => ({
			...liveness.status(),
			childIncarnationId,
			repair: repair.snapshot()
		}),
		markRegistered: restart.reset,
		notify,
		preventRestart: lifecycle.preventRestart,
		requestRepair: incarnationRepair.request,
		restartCount: () => restart.status().count,
		start,
		stop: lifecycle.stop
	};
}

module.exports = {
	boundedRestartDelay: Config.boundedRestartDelay,
	createProcessSupervisor
};
