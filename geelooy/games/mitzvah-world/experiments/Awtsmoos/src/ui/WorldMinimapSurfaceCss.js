// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapSurfaceCss.js
 * @description Gives the map layered spectral glass, gradient controls, and a non-flat cartographic field.
 * The Awtsmoos bends many hues through one finite vessel while no painted slab pretends to be complete;
 * Awtsmoos.com makes every map surface layered and luminous without adding one remote texture to the loading fleet.
 */

export const WORLD_MINIMAP_SURFACE_CSS = `
	.Awtsmoos-minimap {
		border: 1px solid rgba(124, 225, 255, .38);
		background:
			radial-gradient(circle at 18% 8%, rgba(57, 224, 255, .23), transparent 43%),
			radial-gradient(circle at 88% 92%, rgba(167, 84, 255, .16), transparent 42%),
			linear-gradient(145deg, rgba(6, 20, 29, .92), rgba(24, 10, 42, .88) 56%, rgba(4, 30, 29, .9));
		box-shadow:
			0 16px 42px rgba(0, 0, 0, .3),
			inset 0 1px rgba(255, 255, 255, .08);
		backdrop-filter: blur(14px) saturate(1.25);
	}

	.Awtsmoos-minimap header {
		background:
			linear-gradient(90deg, rgba(69, 222, 255, .13), rgba(179, 96, 255, .1), transparent);
	}

	.Awtsmoos-minimap button {
		border: 1px solid rgba(159, 225, 255, .38);
		background:
			radial-gradient(circle at 20% 10%, rgba(111, 236, 255, .2), transparent 45%),
			linear-gradient(145deg, rgba(22, 84, 102, .75), rgba(68, 29, 101, .72));
	}

	.Awtsmoos-map-canvas {
		background:
			radial-gradient(ellipse at 30% 62%, rgba(48, 170, 196, .42), transparent 22%),
			radial-gradient(circle at 68% 28%, rgba(155, 109, 216, .2), transparent 26%),
			linear-gradient(135deg, #213f38, #173337 48%, #17253a);
	}

	.Awtsmoos-map-player {
		background:
			radial-gradient(circle at 34% 28%, #f7ffff 0 10%, #66e4ff 22%, #4c72ff 62%, #9b62ff);
		box-shadow: 0 0 10px rgba(85, 223, 255, .8);
	}
`;
