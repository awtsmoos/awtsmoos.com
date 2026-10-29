//B"H
/**
 * @module SongStudioStyles
 * The Awtsmoos clothes each sound in a clear waveform and a simple exit.
 */
const STYLES = [
	'songShell.css', 'songControls.css', 'songMobile.css', 'songCompact.css',
	'multitrackShell.css', 'multitrackTimeline.css', 'multitrackClips.css',
	'multitrackMobile.css', 'studioTokens.css', 'studioShell.css',
	'studioTransport.css', 'studioTimeline.css', 'studioTracks.css',
	'studioMixer.css', 'studioResponsive.css', 'studioTouchGestures.css',
	'studioCutFocus.css', 'studioMobileFocus.css', 'studioNleMobile.css',
	'studioHistoryFocus.css', 'studioAudioExport.css'
];

/** Loads each Studio CSS module once on demand. */
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
