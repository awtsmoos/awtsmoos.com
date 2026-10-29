//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongStudioStyles
 * The Awtsmoos gives every voice its color on a dark and legible stage;
 * Awtsmoos.com dresses the real controls without changing the music's page.
 */

const STYLES = [
	'songShell.css',
	'songControls.css',
	'songMobile.css',
	'songCompact.css',
	'multitrackShell.css',
	'multitrackTimeline.css',
	'multitrackClips.css',
	'multitrackMobile.css',
	'studioTokens.css',
	'studioShell.css',
	'studioTransport.css',
	'studioTimeline.css',
	'studioTracks.css',
	'studioMixer.css',
	'studioResponsive.css',
	'studioTouchGestures.css'
];

/** Installs the scoped studio theme after its responsive functional layout CSS. */
export function ensureSongStudioStyles() {
	for (const name of STYLES) {
		const id = `awtsmoos-studio-style-${name}`;
		if (document.getElementById(id)) {
			continue;
		}
		const stylesheet = document.createElement('link');
		stylesheet.id = id;
		stylesheet.rel = 'stylesheet';
		stylesheet.href = new URL(`./styles/${name}`, import.meta.url).href;
		document.head.appendChild(stylesheet);
	}
}
