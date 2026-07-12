// B"H

/**
 * B"H — One request owns one lane slot and one terminal retry record. Advisory
 * overtime emits progress but never mutates identity or blocks control work.
 */
function createRequestRunner(dependencies) {
	return async function runRequest(lane, ws, raw, enqueuedAt) {
		const data = dependencies.routedData(raw);
		const payload = data.payload;
		dependencies.state.lanes[lane].inflight += 1;
		let settled = false;
		let advisorySent = false;
		const startedAt = Date.now();
		const advisoryMs = dependencies.Limits.LANE_TIMEOUT_MS[lane] || 300000;
		dependencies.streamEvent('action.started', payload, {
			lane,
			queuedMs: Math.max(0, startedAt - enqueuedAt)
		});
		const keepalive = setInterval(() => {
			if (settled) return;
			const runtimeMs = Date.now() - startedAt;
			const phase = runtimeMs >= advisoryMs
				? 'lane_advisory_overtime'
				: 'lane_running';
			advisorySent ||= runtimeMs >= advisoryMs;
			const progress = { lane, runtimeMs, advisoryMs, advisorySent, phase };
			dependencies.retryControl.progress(data, payload, progress);
			if (ws?.opened) {
				dependencies.sendProgress(ws, data, lane, enqueuedAt, phase, {
					runtimeMs,
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
			if (result && result.ok !== false) {
				dependencies.state.lastSuccessfulActionAt = Date.now();
			}
			const completed = {
				...result,
				lane,
				longLivedConnection: true,
				advisoryOvertime: advisorySent
			};
			dependencies.retryControl.complete(data, payload, completed);
			dependencies.streamEvent(
				result?.ok === false ? 'action.error' : 'action.completed',
				payload,
				{
					lane,
					ok: result?.ok !== false,
					runtimeMs: Date.now() - startedAt,
					result,
					status: result?.status,
					error: result?.error
				}
			);
			dependencies.Send.safeSend(ws, dependencies.Envelope.responseEnvelope(
				data,
				payload,
				completed,
				enqueuedAt,
				dependencies.stats
			));
		} catch (error) {
			if (settled) return;
			settled = true;
			clearInterval(keepalive);
			const failed = {
				ok: false,
				status: 500,
				error: error.message,
				stack: error.stack,
				lane,
				longLivedConnection: true
			};
			dependencies.retryControl.complete(data, payload, failed);
			dependencies.streamEvent('action.error', payload, {
				...failed,
				runtimeMs: Date.now() - startedAt
			});
			dependencies.Send.safeSend(ws, {
				type: 'TUNNEL_RESPONSE',
				id: data.id,
				...dependencies.Correlation.fields(payload),
				...failed
			});
		} finally {
			dependencies.release(lane);
		}
	};
}

async function execute(data, ws, dependencies) {
	const payload = data.payload;
	let result = await dependencies.dispatch(
		dependencies.Kind.normalize(payload),
		payload,
		ws,
		data
	);
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

module.exports = { createRequestRunner, execute };
