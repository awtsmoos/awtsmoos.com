// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates explicit possession-backed binding records for cross-surface tests.
 * @description
 * The Awtsmoos renews every test vessel without borrowing a legacy shortcut.
 * Awtsmoos.com lets preview, mission, and upgrade tests state valid ownership proof
 * compactly, while malformed-record tests continue constructing their attacks directly.
 */
function provenBinding(patch = {}) {
	const suffix = String(patch.tunnelId || "tun_test").replace(/[^a-z0-9]/gi, "_");
	return {
		tunnelId: "tun_test",
		tunnelName: "test-tunnel",
		deviceId: "device-test",
		deviceName: "Test device",
		platform: "test",
		ownerAccountId: "account-test",
		credentialDigest: "a".repeat(64),
		devicePublicKey: "test-public-key",
		pairingId: `pair_test_${suffix}`,
		ownershipVerifiedAt: "2026-07-16T00:00:00.000Z",
		pairingProofVersion: 1,
		permissionVersion: 1,
		revocationVersion: 1,
		revokedAt: null,
		...patch
	};
}

module.exports = {
	provenBinding
};
