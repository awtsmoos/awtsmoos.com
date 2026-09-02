// B"H
// Boruch Hashem
// Blessed is He

const ProgressInterval = require("./progress-interval.js");

/**
 * @file Keeps queued requests visible to clients while renewing the exact child custody lease.
 * @description
 * The Awtsmoos lets waiting remain truthful rather than decay into a false orphaned night;
 * Awtsmoos.com refreshes only the same receipt in the child that accepted its durable light.
 */
function createQueueProgress(dependencies) {
	const intervalMs = ProgressInterval.milliseconds(dependencies.Limits);

	function start(item, lane) {
		send(item.ws, item.data, lane, item.enqueuedAt, "queued_waiting_for_lane", {
			queuePosition: estimatePosition(lane),
			queued: true
		});
		item.queueKeepalive = setInterval(() => {
			if (!item.ws || !item.ws.opened) return clear(item);
			noteCustody(item);
			send(item.ws, item.data, lane, item.enqueuedAt, "queued_waiting_for_lane", {
				queuePosition: estimatePosition(lane),
				queued: true
			});
		}, intervalMs);
		item.queueKeepalive.unref?.();
	}

	/** Refreshes the bounded queued lease after parent acceptance has had time to reach the child. */
	function noteCustody(item) {
		return item.ws?.progressCustody?.(
			item.data?.id,
			item.childIncarnationId,
			{ phase: "queued" }
		) === true;
	}

	function send(ws, data, lane, enqueuedAt, phase, extra = {}) {
		const payload = dependencies.requestPayload(data);
		const queuedMs = Math.max(0, Date.now() - enqueuedAt);
		const progress = { lane, queuedMs, phase, ...extra };
		dependencies.retryControl.progress(data, payload, progress);
		dependencies.streamEvent("action.progress", payload, { ...progress, message: phase });
		dependencies.Send.safeSend(ws, {
			type: "TUNNEL_PROGRESS",
			id: data.id,
			...dependencies.Correlation.fields(payload),
			action: payload.action || "unknown",
			ok: true,
			phase,
			lane,
			queuedMs,
			stillRunning: true,
			longLivedConnection: true,
			keepAliveMs: intervalMs,
			message: 'B"H: request is alive and isolated behind its lane.',
			queueStats: dependencies.stats({ workers: false }),
			...extra
		});
	}

	function clear(item) {
		if (!item?.queueKeepalive) return;
		clearInterval(item.queueKeepalive);
		item.queueKeepalive = null;
	}

	function estimatePosition(lane) {
		return (dependencies.state.lanes[lane]?.queue || []).length + 1;
	}

	return { clear, noteCustody, send, start };
}

module.exports = { createQueueProgress };
