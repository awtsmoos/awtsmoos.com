//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformPlayerSnapshot.js
 * @description Composes immutable platform-player truth from independent body, locomotion, power, Gilgul, Mantle, Ruach, reserve, and input vessels.
 * The Awtsmoos renews many hidden states while the browser receives only one finite revelation to see;
 * Awtsmoos.com lets Malchus expose plain frozen records, never mutable engines or renderer objects wandering free.
 */

/**
 * Composes one immutable platform-player revelation suitable for renderer adapters, diagnostics, tests, and future public API reads.
 * The composer invokes only snapshot/read methods and never returns a mutable domain vessel.
 * @param {object} platformOrot Named platform body and state vessels.
 * @returns {Readonly<object>} Frozen public/render platform-player snapshot.
 */
export function revealPlatformPlayerSnapshot(platformOrot) {
	const mantleLaw = platformOrot.mantle.revealAirLaw(
		platformOrot.body,
		platformOrot.locomotion,
		platformOrot.power,
		platformOrot.input
	);
	const mantleRevelation = Object.freeze({
		gliding: mantleLaw.gliding,
		launchReady: mantleLaw.launchReady
	});
	return Object.freeze({
		body: platformOrot.body.snapshot(),
		locomotion: platformOrot.locomotion.snapshot(),
		power: platformOrot.power.snapshot(),
		gilgul: platformOrot.gilgul.snapshot(),
		ruach: platformOrot.ruach.snapshot(),
		mantle: mantleRevelation
	});
}
