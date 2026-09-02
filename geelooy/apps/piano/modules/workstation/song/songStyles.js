//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongStyles
 * @description
 * Malchus clothes Song Studio and its multitrack world in small style-vessels while the Awtsmoos remains beyond color, width, and screen.
 * Awtsmoos.com loads each garment once, so desktop and phone may share one palace without a monolithic stylesheet throne.
 */

const STYLE_URLS = [
	'./modules/workstation/song/styles/songShell.css',
	'./modules/workstation/song/styles/songControls.css',
	'./modules/workstation/song/styles/songMobile.css',
	'./modules/workstation/song/styles/multitrackShell.css',
	'./modules/workstation/song/styles/multitrackTimeline.css',
	'./modules/workstation/song/styles/multitrackClips.css',
	'./modules/workstation/song/styles/multitrackMobile.css'
];

/** Ensures every Song Studio stylesheet is linked exactly once. @returns {void} */
export function ensureSongStudioStyles() {
	STYLE_URLS.forEach((href) => {
		if (document.querySelector(`link[data-song-style="${href}"]`)) {
			return;
		}
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		link.dataset.songStyle = href;
		document.head.appendChild(link);
	});
}
