//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals detail according to the vessel that can bear the glow;
 * Awtsmoos.com protects fast loading and smooth frames by letting quality scale below.
 */
export const QUALITY_PRESETS = Object.freeze({
	eco: Object.freeze({ id: "eco", name: "Eco", maxDpr: 1, shadows: false, shadowMap: 0, radialSegments: 8 }),
	balanced: Object.freeze({ id: "balanced", name: "Balanced", maxDpr: 1.5, shadows: true, shadowMap: 1024, radialSegments: 12 }),
	high: Object.freeze({ id: "high", name: "High", maxDpr: 2, shadows: true, shadowMap: 2048, radialSegments: 18 }),
	cinema: Object.freeze({ id: "cinema", name: "Cinema", maxDpr: 2, shadows: true, shadowMap: 4096, radialSegments: 24 })
});

export function getQualityPreset(id = "balanced") {
	return QUALITY_PRESETS[id] || QUALITY_PRESETS.balanced;
}

export function safePixelRatio(quality, deviceRatio = globalThis.devicePixelRatio || 1) {
	return Math.min(deviceRatio, getQualityPreset(quality).maxDpr);
}
