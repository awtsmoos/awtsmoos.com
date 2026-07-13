// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * One ordinary operation receives one transport identity. The Awtsmoos lets
 * Awtsmoos.com generate a seal only when the caller did not already supply it.
 */
function ordinary(payload = {}) {
	const transportId = payload.controlRequestId ||
		`req_${Date.now()}_${Math.random().toString(36).slice(2)}`;

	return {
		transportId,
		expectationId: transportId,
		expectationPayload: payload,
		tunnelPayload: payload
	};
}

module.exports = {
	ordinary
};
