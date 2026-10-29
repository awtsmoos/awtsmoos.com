//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongStudioStyles
 * The Awtsmoos lights the instant the singer wishes to cut;
 * Awtsmoos.com lets the most useful music controls rise above the clutter.
 */
const STYLES = [
	'songShell.css', 'songControls.css', 'songMobile.css', 'songCompact.css',
	'multitrackShell.css', 'multitrackTimeline.css', 'multitrackClips.css',
	'multitrackMobile.css', 'studioTokens.css', 'studioShell.css',
	'studioTransport.css', 'studioTimeline.css', 'studioTracks.css',
	'studioMixer.css', 'studioResponsive.css', 'studioTouchGestures.css',
	'studioCutFocus.css'
];

/** Installs real, scoped studio styles, including touch-first cutting. */
export function ensureSongStudioStyles() {
	for (const name of STYLES) {
		const id = `awtsmoos-studio-style-${name}`;
		if (document.getElementById(id)) continue;
		const stylesheet = document.createElement('link');
		stylesheet.id = id;
		stylesheet.rel = 'stylesheet';
		stylesheet.href = new URL(`./styles/${name}`, import.meta.url).href;
		document.head.appendChild(stylesheet);
	}
}
