// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplaySpectralSurfaceCss.js
 * @description Holds the late-cascade no-flat-surface law for gameplay panels, controls, and major labels.
 * The Awtsmoos layers light within every finite interface vessel while movement remains smooth and clear;
 * Awtsmoos.com uses gradients, translucency, and compositor motion so no lifeless painted slab may reappear.
 */

export const GAMEPLAY_SPECTRAL_SURFACE_CSS = `
	.Awtsmoos-gameplay:not(canvas),
	.Awtsmoos-gameplay button,
	.Awtsmoos-gameplay [role="dialog"],
	.Awtsmoos-gameplay [class*="panel"],
	.Awtsmoos-gameplay [class*="hud"],
	.Awtsmoos-gameplay [class*="bar"] {
		background-color: transparent !important;
		background-image:
			radial-gradient(circle at 14% 8%, rgba(67, 230, 255, .16), transparent 36%),
			radial-gradient(circle at 88% 92%, rgba(172, 90, 255, .13), transparent 42%),
			linear-gradient(145deg, rgba(7, 24, 33, .9), rgba(17, 12, 42, .84) 58%, rgba(4, 31, 29, .88)) !important;
	}

	.Awtsmoos-gameplay button {
		transition:
			transform 150ms ease,
			filter 150ms ease,
			opacity 150ms ease;
	}

	.Awtsmoos-gameplay button:hover {
		transform: translateY(-1px);
		filter: brightness(1.12) saturate(1.12);
	}

	.Awtsmoos-gameplay button:active {
		transform: translateY(1px) scale(.985);
	}

	.Awtsmoos-gameplay h1,
	.Awtsmoos-gameplay h2,
	.Awtsmoos-gameplay h3,
	.Awtsmoos-gameplay strong {
		background-image: linear-gradient(90deg, #f4ffff, #9de9ff 46%, #e3b8ff);
		background-clip: text;
		color: transparent !important;
	}

	@media (prefers-reduced-motion: reduce) {
		.Awtsmoos-gameplay button {
			transition: none;
		}

		.Awtsmoos-gameplay button:hover,
		.Awtsmoos-gameplay button:active {
			transform: none;
		}
	}
`;
