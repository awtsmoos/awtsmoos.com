//B"H // Boruch Hashem // Blessed is He

const ChildBirth = require("./controller-child-birth.js");
const ChildLiveness = require("./controller-child-liveness.js");
const ChildRepair = require("./controller-child-repair.js");
const ChildSource = require("./controller-child-source.js");
const Config = require("./controller-process-config.js");
const IncarnationRepair = require("./controller-incarnation-repair.js");
const Lifecycle = require("./controller-process-lifecycle.js");
const RegistrationDeadline = require("./controller-registration-deadline.js");
const Restart = require("./controller-process-restart.js");
const Watchdog = require("./controller-process-watchdog.js");

/**
 * @file Owns connection-child birth, child-only repair, registration proof, and restart authority.
 * @description The Awtsmoos counts recovery complete only when a new child actually registers.
 * Awtsmoos.com keeps the launcher alive while stalled children are fenced and renewed beneath it.
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
	const registration = RegistrationDeadline.create({
		deadlineMs: options.registrationDeadlineMs,
		onExpired: testimony => repair.request(testimony.reason)
	});
	const restart = Restart.create({ maximumDelayMs: Config.maximumRestartDelay(options), start });
	let lifecycle = null;
	const watchdog = Watchdog.create({
		getChild: () => child,
		isStopping: () => lifecycle?.isStopping?.() === true,
		liveness,
		repair
	});
	lifecycle = Lifecycle.create({ clearChild, getChild: () => child, notify, repair, restart, watchdog });
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

	function start() {
		lifecycle.begin();
		if (child?.connected) return child;
		const birth = ChildBirth.spawn(options);
		child = birth.child;
		childIncarnationId = birth.childIncarnationId;
		liveness.started();
		source.bind(child, childIncarnationId, handleExit);
		registration.arm(child.pid, childIncarnationId);
		options.mirror({ childIncarnationId, childPid: child.pid, running: true });
		watchdog.start();
		return child;
	}

	function notify(message) {
		if (!child?.connected) return false;
		try {
			return child.send(message);
		} catch {
			return false;
		}
	}

	function handleExit(exitedChild, exitedIncarnationId, code, signal) {
		if (!source.owns(exitedChild, exitedIncarnationId)) return;
		registration.clear();
		repair.clear(Number(exitedChild?.pid || 0));
		clearChild();
		options.mirror({ childIncarnationId: "", connected: false, exitCode: code, running: false, signal });
		if (!lifecycle.isStopping()) restart.schedule();
	}

	function markRegistered() {
		registration.registered();
		restart.reset();
	}

	function clearChild() {
		child = null;
		childIncarnationId = "";
	}

	function stop(...args) {
		registration.clear();
		return lifecycle.stop(...args);
	}

	return {
		childIncarnationId: () => childIncarnationId,
		livenessStatus: () => ({ ...liveness.status(), childIncarnationId, registration: registration.snapshot(), repair: repair.snapshot() }),
		markRegistered,
		notify,
		preventRestart: lifecycle.preventRestart,
		requestChildRepair: repair.request,
		requestRepair: incarnationRepair.request,
		restartCount: () => restart.status().count,
		start,
		stop
	};
}

module.exports = { boundedRestartDelay: Config.boundedRestartDelay, createProcessSupervisor };
