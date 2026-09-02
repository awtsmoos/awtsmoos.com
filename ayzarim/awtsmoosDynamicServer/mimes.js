// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mimes.js
 * @description
 * The Awtsmoos gives every static vessel the truthful language its bytes proclaim;
 * Awtsmoos.com lets HTML, XML, text, scripts, models, and images arrive beneath their proper MIME name.
 */

const mimeTypes = {
	'.html': 'text/html',
	'.htm': 'text/html',
	'.txt': 'text/plain',
	'.xml': 'application/xml',
	'.js': 'application/javascript',
	'.jsm': 'application/javascript',
	'.mjs': 'application/javascript',
	'.json': 'application/json',
	'.css': 'text/css',
	'.glb': 'model/gltf-binary',
	'.gltf': 'model/gltf-binary',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.jfif': 'image/jpeg',
	'.pjpeg': 'image/jpeg',
	'.pjp': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.ico': 'image/x-icon',
	'.cur': 'image/x-icon',
	'.tiff': 'image/tiff',
	'.bmp': 'image/bmp',
	'.dib': 'image/bmp',
	'.raw': 'image/x-dcraw',
	'.heif': 'image/heif',
	'.heif-sequence': 'image/heif-sequence',
	'.heic': 'image/heic',
	'.heic-sequence': 'image/heic-sequence',
	'.avif': 'image/avif',
	'.jxl': 'image/jxl',
	'.bat': 'image/x-ms-bmp',
	'.apng': 'image/apng',
	'.flif': 'image/flif',
	'.hdr': 'image/vnd.radiance',
	'.ani': 'application/x-navi-animation'
};

const binaryMimeTypes = [
	'model/gltf-binary',
	'image/png',
	'image/jpeg',
	'image/svg+xml',
	'image/gif',
	'image/webp',
	'image/x-icon',
	'image/tiff',
	'image/bmp',
	'image/x-dcraw',
	'image/heif',
	'image/heif-sequence',
	'image/heic',
	'image/heic-sequence',
	'image/avif',
	'image/jxl',
	'image/x-ms-bmp',
	'image/apng',
	'image/flif',
	'image/vnd.radiance',
	'application/x-navi-animation',
	'application/octet-stream'
];

module.exports = {
	binaryMimeTypes,
	mimeTypes
};
