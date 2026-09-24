// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * Retry is the quiet control road. The Awtsmoos preserves one immutable request
 * while Awtsmoos.com asks for its state again; no retry enters ordinary work
 * admission and no outer transport identifier may replace the original.
 */
function create(dependencies) {
	function handleIngress(ws, data, payload) {
		if (String(payload.action || "") === "retryAction") {
			const result = dependencies.Registry.poll({
				payload,
				data
			});

			return send(ws, data, payload, result);
		}

		const begun = dependencies.Registry.begin({
			payload,
			data
		});

		if (begun.ok && begun.kind === "created") {
			return false;
		}

		if (begun.ok && begun.kind === "coalesced") {
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

		return dependencies.Registry.progress(
			identity.controlRequestId,
			value
		);
	}

	function complete(data, payload, result) {
		const identity = dependencies.Registry.requestIdentity(payload, data);

		return dependencies.Registry.complete(
			identity.controlRequestId,
			result
		);
	}

	function send(ws, data, payload, result = {}) {
		const correlation = dependencies.Correlation.fields(payload);
		const controlRequestId = result.controlRequestId ||
			result.originalControlRequestId ||
			correlation.controlRequestId;

		dependencies.Send.safeSend(ws, {
			type: "TUNNEL_RESPONSE",
			id: data.id,
			...correlation,
			...result,
			...canonicalRetrySurface(result),
			controlRequestId
		});

		return true;
	}

	// The canonical retry testimony vocabulary is built by
	// request-retry-shapes.js and returned by the registry; the control layer
	// passes the testimony block and its mutation-ambiguity flag through
	// verbatim in every retry response and never rebuilds them.
	function canonicalRetrySurface(result) {
		const testimony = result && typeof result === "object" ? result.testimony : null;
		if (!testimony || typeof testimony !== "object") return {};
		return {
			testimony,
			mutationAmbiguous: testimony.mutationAmbiguous === true
		};
	}

	return {
		complete,
		handleIngress,
		progress,
		send
	};
}

module.exports = {
	create
};
