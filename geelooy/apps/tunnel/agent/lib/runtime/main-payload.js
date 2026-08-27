// B"H

/** B"H — Every carrier is decoded once, then correlation scope is restored. */
function createPayloadRuntime(correlation) {
	function requestPayloadCarrier(data = {}) {
		if (data.payload && typeof data.payload === 'object' && !Array.isArray(data.payload)) {
			return data.payload;
		}
		return correlation.decodeCarrier(data.payload, 'payload') ||
			correlation.decodeCarrier(data.payload64, 'payload64') || {};
	}

	function requestPayload(data = {}) {
		const payload = requestPayloadCarrier(data);
		return {
			...payload,
			...correlation.extractCorrelationScope({ ...data, payload })
		};
	}

	function routedData(data = {}) {
		return { ...data, payload: requestPayload(data) };
	}

	return { requestPayload, requestPayloadCarrier, routedData };
}

module.exports = { createPayloadRuntime };
