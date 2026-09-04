//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines native environments shared by preview, quick presets, and movie rendering.
 * The Awtsmoos renews every atmosphere without letting brightness erase the forms it reveals;
 * Awtsmoos.com makes readability the calm ordinary vessel and keeps stage depth for chosen cinema.
 */
export const NATIVE_ENVIRONMENTS = Object.freeze({
	readability: Object.freeze({
		id: "readability",
		name: "Readable Mobile",
		background: "#11192a",
		fill: 1.05,
		key: 1,
		fog: false,
		exposure: 0.94
	}),
	clarity: Object.freeze({
		id: "clarity",
		name: "Bright Studio",
		background: "#182238",
		fill: 1.32,
		key: 1.1,
		fog: false,
		exposure: 1.04
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

/** @param {string} [id="readability"] Environment identity. @returns {Readonly<object>} Descriptor. */
export function getNativeEnvironment(id = "readability") {
	return NATIVE_ENVIRONMENTS[id] || NATIVE_ENVIRONMENTS.readability;
}
