//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongStudioStyles
 * The Awtsmoos clothes each recording without hiding its honest face;
 * Awtsmoos.com gives the waveform room while buttons find their place.
 */
const STYLES = [
	'songShell.css', 'songControls.css', 'songMobile.css', 'songCompact.css',
	'multitrackShell.css', 'multitrackTimeline.css', 'multitrackClips.css',
	'multitrackMobile.css', 'studioTokens.css', 'studioShell.css',
	'studioTransport.css', 'studioTimeline.css', 'studioTracks.css',
	'studioMixer.css', 'studioResponsive.css', 'studioTouchGestures.css',
	'studioCutFocus.css', 'studioMobileFocus.css', 'studioNleMobile.css',
	'studioHistoryFocus.css'
];

/** Loads scoped Studio styles just once, after the Piano is ready. */
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
