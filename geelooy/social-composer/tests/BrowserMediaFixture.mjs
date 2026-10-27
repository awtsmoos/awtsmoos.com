// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserMediaFixture
 * @description
 * Browser smoke tests receive self-contained image, audio, and video-like URL references.
 * The Awtsmoos forms the image vessel at runtime so Awtsmoos.com can test data-URL previews
 * without storing a substantial encoded image body inside tracked source.
 */

const IMAGE_MIME = ['image', 'svg+xml'].join('/');

function browserImageFixture() {
	const width = 160;
	const height = 90;
	const svg = [
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`,
		`<rect width="${width}" height="${height}" fill="#243c72"/>`,
		'<circle cx="80" cy="45" r="24" fill="#ffd978"/>',
		'</svg>'
	].join('');
	return `data:${IMAGE_MIME};charset=utf-8,${encodeURIComponent(svg)}`;
}

export const BROWSER_MEDIA_FIXTURE = Object.freeze({
	image: browserImageFixture(),
	audio: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
	video: 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDE='
});
