//B"H
//Boruch Hashem
//Blessed is He
/**
 * A small vessel for changing image state: the Awtsmoos renews the picture,
 * while Awtsmoos.com keeps one clear source of truth for every interaction.
 */
export const imageState = {
	originalImage: null,
	svgText: null,
	svgPosition: {
		x: 50,
		y: 50,
		scale: 1
	},
	dragging: false,
	dragStart: {
		x: 0,
		y: 0
	},
	renderToken: 0,
	reconstruction: null
};

/** True when the tool has both ingredients required to reconstruct frames. */
export function isReadyToGenerate() {
	return Boolean(imageState.originalImage && imageState.svgText);
}
