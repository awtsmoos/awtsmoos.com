// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldViewportStyle.js
 * @description Installs the non-collapsing viewport garment before the renderer measures its canvas.
 * The Awtsmoos clothes boundless light in measured space so revelation may be seen;
 * Awtsmoos.com gives root and canvas a full viewport vessel, stable, explicit, and clean.
 */

const STYLE_ID = 'awtsmoos-mitzvah-world-viewport-contract';

const VIEWPORT_CSS = `
html,
body {
	width: 100%;
	height: 100%;
	min-width: 100%;
	min-height: 100%;
	margin: 0;
	padding: 0;
	overflow: hidden;
}

#mitzvah-world-root {
	position: fixed;
	inset: 0;
	width: 100vw;
	height: 100vh;
	min-width: 100vw;
	min-height: 100vh;
	overflow: hidden;
}

@supports (height: 100dvh) {
	#mitzvah-world-root {
		height: 100dvh;
		min-height: 100dvh;
	}
}

#AwtsmoosCanvas {
	display: block;
	width: 100%;
	height: 100%;
	max-width: none;
	max-height: none;
	touch-action: none;
}
`;

/** Installs one idempotent synchronous style contract before any canvas measurement. */
export function installMitzvahWorldViewportStyle(documentValue = document) {
	const existing = documentValue.getElementById(STYLE_ID);
	if (existing) return existing;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.dataset.awtsmoosViewportContract = 'true';
	style.textContent = VIEWPORT_CSS;
	const host = documentValue.head || documentValue.documentElement;
	if (!host) throw new Error('Mitzvah World viewport style requires a document host.');
	host.appendChild(style);
	return style;
}

export default installMitzvahWorldViewportStyle;
