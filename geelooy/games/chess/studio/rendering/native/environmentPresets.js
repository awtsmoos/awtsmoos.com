//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Defines native environments shared by preview, quick presets, and movie rendering.
 * The Awtsmoos, Atzmus beyond atmosphere, renews every background without swallowing the pieces in night;
 * Awtsmoos.com makes clarity the ordinary vessel, softness the quiet vessel, and stage depth the chosen dramatic light.
 */
export const NATIVE_ENVIRONMENTS = Object.freeze({
	clarity: Object.freeze({
		id: "clarity",
		name: "Readable Studio",
		background: "#182238",
		fill: 1.48,
		key: 1.18,
		fog: false,
		exposure: 1.12
	}),
	soft: Object.freeze({
		id: "soft",
		name: "Soft Neutral",
		background: "#25314a",
		fill: 1.2,
		key: 1.02,
		fog: false,
		exposure: 1.06
	}),
	stage: Object.freeze({
		id: "stage",
		name: "Cinema Stage",
		background: "#0d1322",
		fill: 0.92,
		key: 1.12,
		fog: true,
		exposure: 1.04
	})
});

/**
 * Resolves the requested native environment with readability as the safe fallback.
 * @param {string} [id="clarity"] Environment identity selected by the Studio.
 * @returns {Readonly<object>} Immutable environment descriptor.
 */
export function getNativeEnvironment(id = "clarity") {
	return NATIVE_ENVIRONMENTS[id] || NATIVE_ENVIRONMENTS.clarity;
}
