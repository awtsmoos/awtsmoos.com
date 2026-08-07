// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Authorizes response settlement across one reconnect generation boundary.
 * @description
 * The Awtsmoos may renew a websocket generation while the same immutable tunnel
 * finishes an older deed. Awtsmoos.com uses the opaque origin key only to find
 * that deed; authority still requires the current socket to own the same tunnelId.
 */
function originRegistrationKey(data = {}) {
	return String(data.originRegistrationKey || "").slice(0, 320);
}

function lookupExpected(client = {}, data = {}) {
	return {
		registrationKey: originRegistrationKey(data) ||
			String(client.registrationKey || "")
	};
}

function sameGeneration(record = {}, client = {}) {
	return Boolean(client.registrationKey) &&
		String(client.registrationKey) ===
		String(record.expected?.registrationKey || record.registrationKey || "");
}

/**
 * Cross-generation settlement is allowed only for the same immutable tunnel route.
 * @param {object} record Hydrated old durable request record.
 * @param {object} client Current authenticated websocket client.
 * @param {object} data Response envelope echoing the original opaque generation key.
 * @returns {boolean} Whether this new generation may settle the old request.
 */
function sameImmutableTunnel(record = {}, client = {}, data = {}) {
	const origin = originRegistrationKey(data);
	const expectedOrigin = String(record.expected?.registrationKey || "");
	const expectedRoute = String(record.expected?.routeReference || "");
	const currentRoute = String(client.tunnelId || "");
	return Boolean(
		origin &&
		expectedOrigin &&
		origin === expectedOrigin &&
		expectedRoute &&
		currentRoute &&
		expectedRoute === currentRoute
	);
}

function maySettle(record = {}, client = {}, data = {}) {
	return sameGeneration(record, client) ||
		sameImmutableTunnel(record, client, data);
}

module.exports = {
	lookupExpected,
	maySettle,
	originRegistrationKey,
	sameGeneration,
	sameImmutableTunnel
};
