// B"H
// Boruch Hashem
// Blessed is He

const ProgressInterval = require("./progress-interval.js");

/**
 * @file Emits truthful stages and immutable parent-only scheduling metadata.
 * @description
 * The Awtsmoos distinguishes lane dequeue from a real consumer; Awtsmoos.com
 * carries the lane name beside the observer without serializing callbacks into IPC.
 */
function startRunProgress(dependencies, context) {
	const requestId = String(context.data?.id || "");
	const metadata = Object.freeze({
		enqueuedAt: Number(context.enqueuedAt || context.startedAt || Date.now()),
		lane: String(context.lane || ""),
		requestId
	});
	const state = {
		advisorySent: false,
		consumerStarted: false,
		lastPhase: "lane_dequeued",
		settled: false
	};
	const advisoryMs = dependencies.Limits.LANE_TIMEOUT_MS[context.lane] || 300000;
	dependencies.executionStages?.begin?.(requestId, context.lane, context.startedAt);

	function mark(phase, details = {}) {
		if (state.settled) return false;
		state.consumerStarted ||= details.consumerStarted === true;
		state.lastPhase = String(phase || state.lastPhase);
		dependencies.executionStages?.mark?.(requestId, state.lastPhase, {
			consumerStarted: state.consumerStarted
		});
		sendProgress(dependencies, context, state.lastPhase, {
			...details,
			consumerStarted: state.consumerStarted
		});
		return true;
	}

	mark("lane_dequeued", { consumerStarted: false, queued: false, runtimeMs: 0 });
	const timer = setInterval(() => {
		if (state.settled) return;
		const runtimeMs = Date.now() - context.startedAt;
		state.advisorySent ||= runtimeMs >= advisoryMs;
		mark(state.advisorySent ? "lane_advisory_overtime" : "lane_running", {
			advisorySent: state.advisorySent,
			advisoryTimeoutMs: advisoryMs,
			consumerStarted: state.consumerStarted,
			queued: false,
			runtimeMs
		});
	}, ProgressInterval.milliseconds(dependencies.Limits));
	timer.unref?.();

	function stop() {
		state.settled = true;
		clearInterval(timer);
		dependencies.executionStages?.finish?.(requestId);
	}

	return { mark, metadata, state, stop };
}

function sendProgress(dependencies, context, phase, details = {}) {
	const progress = { lane: context.lane, phase, ...details };
	dependencies.retryControl.progress(context.data, context.payload, progress);
	dependencies.streamEvent("action.progress", context.payload, { ...progress, message: phase });
	if (!context.ws?.opened) return;
	dependencies.sendProgress(
		context.ws,
		context.data,
		context.lane,
		context.enqueuedAt,
		phase,
		progress
	);
}

module.exports = { sendProgress, startRunProgress };
