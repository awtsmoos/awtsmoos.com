// B"H

/**
 * B"H — One request owns one lane slot and one terminal envelope. Advisory
 * overtime emits progress but never mutates identity or blocks control work.
 */
function createRequestRunner(dependencies) {
	return async function runRequest(lane, ws, raw, enqueuedAt) {
		const data = dependencies.routedData(raw);
		dependencies.state.lanes[lane].inflight += 1;
		let settled = false;
		let advisorySent = false;
		const startedAt = Date.now();
		const advisoryMs = dependencies.Limits.LANE_TIMEOUT_MS[lane] || 300000;
		dependencies.streamEvent('action.started', data.payload, {
			lane,
			queuedMs: Math.max(0, startedAt - enqueuedAt)
		});
		const keepalive = setInterval(() => {
			if (settled) return;
			const age = Date.now() - startedAt;
			const phase = age >= advisoryMs ? 'lane_advisory_overtime' : 'lane_running';
			advisorySent ||= age >= advisoryMs;
			if (ws?.opened) {
				dependencies.sendProgress(ws, data, lane, enqueuedAt, phase, {
					runtimeMs: age,
					advisoryTimeoutMs: advisoryMs,
					advisorySent
				});
			}
		}, dependencies.Limits.KEEPALIVE_MS);
		keepalive.unref?.();
		try {
			const result = await execute(data, ws, dependencies);
			if (settled) return;
			settled = true;
			clearInterval(keepalive);
			if (result && result.ok !== false) dependencies.state.lastSuccessfulActionAt = Date.now();
			dependencies.streamEvent(result?.ok === false ? 'action.error' : 'action.completed', data.payload, {
				lane,
				ok: result?.ok !== false,
				runtimeMs: Date.now() - startedAt,
				result,
				status: result?.status,
				error: result?.error
			});
			dependencies.Send.safeSend(ws, dependencies.Envelope.responseEnvelope(
				data,
				data.payload,
				{ ...result, lane, longLivedConnection: true, advisoryOvertime: advisorySent },
				enqueuedAt,
				dependencies.stats
			));
		} catch (error) {
			if (settled) return;
			settled = true;
			clearInterval(keepalive);
			dependencies.streamEvent('action.error', data.payload, {
				lane,
				ok: false,
				status: 500,
				error: error.message,
				runtimeMs: Date.now() - startedAt
			});
			dependencies.Send.safeSend(ws, {
				type: 'TUNNEL_RESPONSE',
				id: data.id,
				...dependencies.Correlation.fields(data.payload),
				ok: false,
				status: 500,
				error: error.message,
				stack: error.stack,
				lane,
				longLivedConnection: true
			});
		} finally {
			dependencies.release(lane);
		}
	};
}

async function execute(data, ws, dependencies) {
	const payload = data.payload;
	let result = await dependencies.dispatch(dependencies.Kind.normalize(payload), payload, ws, data);
	result = await dependencies.Continue.run({
		result,
		payload,
		ws,
		data,
		dispatch: dependencies.dispatch,
		normalize: dependencies.Kind.normalize
	});
	return result;
}

module.exports = { createRequestRunner };
