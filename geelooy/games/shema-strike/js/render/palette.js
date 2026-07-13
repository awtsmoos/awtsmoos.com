//B"H
// Boruch Hashem
// Blessed is He
/**
 * Palettes clothe each gate in a distinct atmosphere; Awtsmoos.com is the light before every visible color.
 * Theme fragments resolve uncommon authored names into stable, high-contrast canvas colors.
 */
const PALETTES = Object.freeze({
	garden: ["#07151b", "#17444a", "#79b86b", "#f4db79"],
	moon: ["#05071a", "#1f255c", "#7770b7", "#d8eeff"],
	sky: ["#07162f", "#22568a", "#8cccf0", "#f4fbff"],
	desert: ["#1c0e1c", "#6d382e", "#d99551", "#ffe096"],
	cave: ["#050914", "#172b41", "#347b91", "#83f2ff"],
	city: ["#080916", "#242c50", "#8d659e", "#ffd782"],
	storm: ["#05070d", "#1d283d", "#526e91", "#d7efff"],
	heaven: ["#11122d", "#5553a2", "#aad8ff", "#fff8ca"],
	cosmic: ["#03030b", "#211348", "#754da4", "#f4ceff"],
	void: ["#010104", "#121225", "#443078", "#fcf6ff"],
	infinite: ["#010106", "#2c1450", "#8f6ac8", "#fff4ad"]
});

export const resolvePalette = (theme = "cosmic") => {
	const key = Object.keys(PALETTES).find((name) => theme.includes(name));
	return PALETTES[key ?? "cosmic"];
};
