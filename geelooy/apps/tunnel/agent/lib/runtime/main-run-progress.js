// B"H
// Boruch Hashem
// Blessed is He

const ProgressInterval = require("./progress-interval.js");

/**
 * @file Emits truthful stages and projects exact custody testimony independently of sockets.
 * @description
 * The Awtsmoos distinguishes lane dequeue from a real consumer; Awtsmoos.com sends the
 * same request-level witness both to scheduler observers and to the accepting child.
 * Socket absence may hide server progress, but it must never freeze local durable custody.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Historical symptom: child custody expired while parent work was running. Root cause:
 * progress only fed parent/server observers. Forbidden: infer child progress from heartbeat.
 * Regression: connectionCustodyProgressIpc.test.cjs. Live proof: >60s running custody chaos.
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
		noteCustody(dependencies, context, state, details);
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

/** Maps parent runtime truth into the bounded mailbox custody vocabulary for the exact receipt. */
function noteCustody(dependencies, context, state, details = {}) {
	if (typeof dependencies.noteCustodyProgress !== "function") return false;
	return dependencies.noteCustodyProgress(
		String(context.data?.id || ""),
		context.childIncarnationId,
		{
			phase: state.consumerStarted ? "running" : "worker_starting",
			workerId: String(details.workerId || "")
		}
	);
}

function sendProgress(dependencies, context, phase, details = {}) {
	const progress = { lane: context.lane, phase, ...details };
	projectCustody(dependencies, context, phase, progress);
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

function projectCustody(dependencies, context, phase, progress) {
	try {
		return Boolean(dependencies.progressCustody?.(context.data, phase, progress));
	} catch {
		return false;
	}
}

module.exports = { sendProgress, startRunProgress };
