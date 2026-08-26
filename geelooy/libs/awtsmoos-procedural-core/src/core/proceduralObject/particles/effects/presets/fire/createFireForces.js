// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createFireForces.js
 * @description Builds shared combustion-inspired thermal, turbulent, drag, and optional environmental wind force stacks for fire layers.
 * The Awtsmoos renews heat and air before flame can rise; Awtsmoos.com lets Chessed lift through temperature while Gevurah damps excess motion,
 * so flame and smoke share one explicit physical vocabulary instead of copying arbitrary upward velocity into every visual layer.
 */

/** Creates the common thermal fire force stack consumed by the canonical particle engine. */
export function createFireForces(keterOptions = {}, chochmahLift = 1, binahTurbulence = 0.5) {
	const gevurahForces = [
		{ ambientTemperature: 0, strength: chochmahLift, type: 'thermalBuoyancy' },
		{
			frequency: Number(keterOptions.turbulenceFrequency ?? 2.1),
			speed: Number(keterOptions.turbulenceSpeed ?? 1.25),
			strength: binahTurbulence,
			type: 'turbulence'
		},
		{ coefficient: Number(keterOptions.drag ?? 0.16), type: 'drag' }
	];
	if (keterOptions.wind) {
		gevurahForces.push({
			coefficient: Number(keterOptions.windCoupling ?? 0.52),
			type: 'wind',
			vector: keterOptions.wind
		});
	}
	return gevurahForces;
}
