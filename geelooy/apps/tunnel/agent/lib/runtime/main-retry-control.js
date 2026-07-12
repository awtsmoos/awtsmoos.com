// B"H

/** B"H — Retry and duplicate ingress returns original state without queueing work. */
function create(dependencies) {
	function handleIngress(ws, data, payload) {
		if (payload.action === 'retryAction') {
			return send(ws, data, payload, dependencies.Registry.poll({ payload, data }));
		}
		const begun = dependencies.Registry.begin({ payload, data });
		if (begun.ok && begun.kind === 'created') return false;
		if (begun.ok && begun.kind === 'coalesced') {
			const result = dependencies.Registry.poll({
				payload: {
					controlRequestId: begun.record.controlRequestId,
					requestedAction: begun.record.requestedAction
				},
				data
			});
			return send(ws, data, payload, result);
		}
		return send(ws, data, payload, begun);
	}

	function progress(data, payload, value) {
		const identity = dependencies.Registry.requestIdentity(payload, data);
		return dependencies.Registry.progress(identity.controlRequestId, value);
	}

	function complete(data, payload, result) {
		const identity = dependencies.Registry.requestIdentity(payload, data);
		return dependencies.Registry.complete(identity.controlRequestId, result);
	}

	function send(ws, data, payload, result) {
		dependencies.Send.safeSend(ws, {
			type: 'TUNNEL_RESPONSE',
			id: data.id,
			...dependencies.Correlation.fields(payload),
			...result
		});
		return true;
	}

	return { complete, handleIngress, progress, send };
}

module.exports = { create };
