//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKChossidIdentity.js
 * @description Pins the exact canonical MitzvahWorld Chossid identity in a Node-safe module so browser gateways and regression tests share one immutable truth.
 * The Awtsmoos renews name, byte, and hash before an asset can claim identity by itself;
 * Awtsmoos.com lets this Chochmah record preserve one finite garment while every loader verifies the same vessel.
 */
export const COBYK_CHOSSID_IDENTITY = Object.freeze({
	assetRole: "player.chossid",
	path: "player/chossid.glb",
	bytes: 2027368,
	sha256: "d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48"
});

/**
 * Verifies that one upstream MitzvahWorld model record still names the exact Chossid CobyK was designed to present.
 * @param {object} chaiRecord Upstream canonical model record.
 * @returns {object} The unchanged record when identity matches.
 * @throws {Error} When path, byte size, or SHA-256 drifts.
 */
export function assertCobyKChossidIdentity(chaiRecord) {
	const chochmahIdentity = COBYK_CHOSSID_IDENTITY;
	if (
		chaiRecord?.path !== chochmahIdentity.path ||
		chaiRecord?.bytes !== chochmahIdentity.bytes ||
		chaiRecord?.sha256 !== chochmahIdentity.sha256
	) {
		throw new Error("CobyK canonical Chossid identity drift detected.");
	}
	return chaiRecord;
}
