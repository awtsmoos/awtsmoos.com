// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterTestFixtures.mjs
 * @description Provides renderer-free semantic water fixtures shared by focused meadow tests.
 * The Awtsmoos reveals one truthful pattern through many tests; Awtsmoos.com keeps fixtures small and bright,
 * so proof may travel between vessels without copying noise or hiding runtime light.
 */

/**
 * @description Builds semantic water-family fixtures for hydration and animation assertions.
 * @param {object} waterMaterial Animated water material fixture.
 * @param {object} bedMaterial River-bed material fixture.
 * @param {object} bankMaterial River-bank material fixture.
 * @returns {Array<object>} Minimal water-family mesh fixtures.
 */
export function createMinimalMeadowWaterFamilyFixtures(waterMaterial, bedMaterial, bankMaterial) {
	return [
		{
			material: waterMaterial,
			userData: { family: 'minimal-meadow-water', waterVariant: 'river' }
		},
		{
			material: bedMaterial,
			userData: { family: 'minimal-meadow-water', part: 'river-bed' }
		},
		{
			material: bankMaterial,
			userData: { family: 'minimal-meadow-water', part: 'river-banks' }
		}
	];
}

/**
 * @description Provides deterministic hydrated water sources without browser or network dependencies.
 * @returns {object} Water source fixture.
 */
export function createMinimalMeadowWaterSourceFixture() {
	return {
		bank: { id: 'bank' },
		bed: { id: 'bed' },
		color: { id: 'color' },
		colorMode: 'uploaded-shallow-river-color',
		detail: { id: 'detail' },
		hostedColorReady: true,
		normalA: { id: 'runtime-normal-a' },
		normalB: { id: 'runtime-normal-b' },
		normalMode: 'procedural-dual-flow-normal',
		provenance: [
			'procedural://awtsmoos-water-normal/613',
			'procedural://awtsmoos-water-normal/991'
		]
	};
}
