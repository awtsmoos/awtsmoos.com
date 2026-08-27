// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates immutable native and browser socket fixtures for isolation tests.
 * @description
 * The Awtsmoos renews account, tunnel, device, and socket without confusing their
 * names. Awtsmoos.com centralizes valid and forged registry vessels so the test
 * remains focused on authorization assertions rather than fixture construction.
 */
function binding(ownerAccountId, tunnelId, deviceId) {
	return {
		ownerAccountId,
		tunnelId,
		deviceId,
		tunnelName: "same-name",
		devicePublicKey: "test-key",
		credentialDigest: "x".repeat(64),
		pairingId: `pair_test_${ownerAccountId}`,
		ownershipVerifiedAt: new Date().toISOString(),
		pairingProofVersion: 1,
		revokedAt: null
	};
}

function nativeClient(bindingRecord, registeredAt) {
	return {
		isTunnel: true,
		accessKind: "device",
		accountId: bindingRecord.ownerAccountId,
		tunnelId: bindingRecord.tunnelId,
		deviceId: bindingRecord.deviceId,
		tunnelName: bindingRecord.tunnelName,
		vesselType: "native",
		registeredAt
	};
}

function browserClient(accountId, registeredAt) {
	return {
		isTunnel: true,
		accountId,
		tunnelName: "browser-name",
		vesselType: "browser",
		registeredAt
	};
}

function serverFixture(clients, calls) {
	return {
		tunnelClients: new Map(clients.map((client, index) => [index, client])),
		ws: {
			clients: new Set(clients),
			async sendTunnelRequest(...argumentsList) {
				calls.push(argumentsList);
				return {
					ok: true,
					action: argumentsList[2].action,
					tunnelName: argumentsList[1]
				};
			}
		}
	};
}

module.exports = {
	binding,
	browserClient,
	nativeClient,
	serverFixture
};
