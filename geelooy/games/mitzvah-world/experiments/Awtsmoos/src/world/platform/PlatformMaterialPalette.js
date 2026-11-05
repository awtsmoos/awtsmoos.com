// B"H
// Boruch Hashem
// Blessed is He

/** @file PlatformMaterialPalette.js @description Measured styles for generated semantic parts. */
const ROLE_STYLES = Object.freeze({
	'river-banks': Object.freeze({ color: '#70543a', roughness: 0.92 }),
	'river-water': Object.freeze({ color: '#39b9c8', opacity: 0.78, roughness: 0.16, transparent: true }),
	'terrain-surface': Object.freeze({ color: '#5d8b4c', roughness: 0.96 }),
	'well-roof': Object.freeze({ color: '#934f39', roughness: 0.86 }),
	'well-stone': Object.freeze({ color: '#a39a88', roughness: 0.94 }),
	'well-water': Object.freeze({ color: '#36adc2', opacity: 0.8, roughness: 0.14, transparent: true }),
	'well-wood': Object.freeze({ color: '#6f462a', roughness: 0.9 })
});

export function platformPartStyle(part, textureRecord = null) {
	const style = { ...(ROLE_STYLES[part.role] || { color: '#d8cfae' }) };
	if (/water/.test(part.role) && textureRecord?.ok) {
		Object.assign(style, {
			mapImage: textureRecord.image,
			mapRepeat: [4, 4],
			textureUrl: textureRecord.url
		});
	}
	return style;
}

export function platformTerrainStyle() {
	return { ...ROLE_STYLES['terrain-surface'] };
}
