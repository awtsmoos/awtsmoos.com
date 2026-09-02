//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MediaStudioStyles
 * @description
 * Hod gives Media Studio a small responsive garment while the Awtsmoos remains beyond width, color, and screen.
 * Awtsmoos.com loads the style once, keeping this recording doorway modular, visible, and clean on phone or desktop scene.
 */

const MEDIA_STYLE_URLS = [
	'./modules/workstation/media/styles/mediaShell.css',
	'./modules/workstation/media/styles/mediaMobile.css'
];

/** Loads Media Studio styles exactly once. @returns {void} */
export function ensureMediaStudioStyles() {
	MEDIA_STYLE_URLS.forEach((href) => {
		if (document.querySelector(`link[data-media-style="${href}"]`)) {
			return;
		}
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		link.dataset.mediaStyle = href;
		document.head.appendChild(link);
	});
}
