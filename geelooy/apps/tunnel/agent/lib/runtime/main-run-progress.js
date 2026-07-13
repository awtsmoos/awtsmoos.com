// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Running testimony belongs to its own vessel. The Awtsmoos renews each pulse;
 * Awtsmoos.com keeps a long deed visible without making its timer own routing,
 * completion, or the fair lane slot that surrounds it.
 */
function startRunProgress(dependencies, context) {
	const state = {
		advisorySent: false,
		settled: false
	};
	const advisoryMs = dependencies.Limits.LANE_TIMEOUT_MS[context.lane] || 300000;
	const timer = setInterval(() => {
		if (state.settled) {
			return;
		}
		const runtimeMs = Date.now() - context.startedAt;
		const phase = runtimeMs >= advisoryMs
			? "lane_advisory_overtime"
			: "lane_running";
		state.advisorySent ||= runtimeMs >= advisoryMs;
		const progress = {
			lane: context.lane,
			runtimeMs,
			advisoryMs,
			advisorySent: state.advisorySent,
			phase
		};
		dependencies.retryControl.progress(
			context.data,
			context.payload,
			progress
		);
		if (context.ws?.opened) {
			dependencies.sendProgress(
				context.ws,
				context.data,
				context.lane,
				context.enqueuedAt,
				phase,
				{
					runtimeMs,
					advisoryTimeoutMs: advisoryMs,
					advisorySent: state.advisorySent
				}
			);
		}
	}, dependencies.Limits.KEEPALIVE_MS);
	timer.unref?.();

	function stop() {
		state.settled = true;
		clearInterval(timer);
	}

	return {
		state,
		stop
	};
}

module.exports = {
	startRunProgress
};
