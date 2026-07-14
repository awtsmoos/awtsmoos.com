// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Finalization = require("./finalization.js");

/**
 * B"H
 *
 * Child output renews liveness while timeout, error, and close become explicit
 * terminal signals. Once reaping owns the ending, late process events become
 * evidence only and cannot reserve a competing durable finalization.
 */
function wireProcess(config, jobId, live, timeoutMs) {
	live.timer = setTimeout(() => {
		void live.reaper.reapWorker(live.meta.workerId, {
			reason: "command_timeout",
			status: "timed_out",
			error: `command_timeout:${timeoutMs}`
		});
	}, timeoutMs);
	live.timer.unref?.();
	live.child.stdout.on("data", chunk => append(
		config,
		jobId,
		live,
		"stdout",
		chunk
	));
	live.child.stderr.on("data", chunk => append(
		config,
		jobId,
		live,
		"stderr",
		chunk
	));
	live.child.once("error", error => {
		if (ownedByReaper(live)) {
			live.lateProcessError = error.message;
			return;
		}
		void Finalization.reserve(config, jobId, live, async () => ({
			status: "failed",
			error: error.message
		}));
	});
	live.child.once("close", (code, signal) => {
		if (ownedByReaper(live)) {
			live.lateProcessExit = {
				exitCode: code,
				signal
			};
			return;
		}
		void Finalization.reserve(config, jobId, live, async () => ({
			status: code === 0
				? "completed"
				: "failed",
			exitCode: code,
			signal
		}));
	});
}

function append(config, jobId, live, stream, chunk) {
	Context.Heartbeat.touch(live);
	Context.IO.append(
		config,
		jobId,
		stream,
		chunk,
		live
	);
}

function ownedByReaper(live = {}) {
	return live.terminalOwner === "reaper";
}

module.exports = {
	append,
	ownedByReaper,
	wireProcess
};
