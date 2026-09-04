// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the dependency witnesses for terminal-result success and failure regressions.
 * @description
 * The Awtsmoos sends result truth through transport, event, retry, and custody gates in light;
 * Awtsmoos.com keeps each simulated boundary explicit, spacious, and bright.
 * These dependencies mirror only the interfaces touched by the real terminal runtime flight.
 */
function create(collections) {
	return {
		state: {
			pendingResponses: []
		},
		stats: {},
		Send: createSend(),
		Correlation: createCorrelation(),
		Envelope: createEnvelope(),
		retryControl: createRetryControl(),
		streamEvent(name, payload, detail) {
			collections.events.push({
				name,
				detail
			});
		},
		progressCustody(data, phase, detail) {
			collections.parent.push({
				phase,
				...detail
			});
			return true;
		},
		noteCustodyProgress(receiptId, incarnationId, detail) {
			collections.child.push({
				receiptId,
				incarnationId,
				...detail
			});
			return true;
		}
	};
}

function createSend() {
	return {
		compact(envelope) {
			return envelope;
		}
	};
}

function createCorrelation() {
	return {
		fields() {
			return {
				requestId: "request-one"
			};
		}
	};
}

function createEnvelope() {
	return {
		responseEnvelope(data, payload, result) {
			return {
				type: "TUNNEL_RESPONSE",
				id: data.id,
				...result
			};
		}
	};
}

function createRetryControl() {
	return {
		complete(data, payload, result) {
			return {
				result
			};
		}
	};
}

module.exports = {
	create
};
