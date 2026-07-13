// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialOrigin.js
 * @description Names the one public Firebase origin from which every material
 * vessel is resolved. Many paths, one origin, beneath the creating Awtsmoos.
 */
export const PUBLIC_MATERIAL_ORIGIN = 'https://awtsmoos-docs-base.web.app';
export const PUBLIC_MATERIAL_CATALOG_URL = `${PUBLIC_MATERIAL_ORIGIN}/catalog/materials.json`;

/** Encodes each path segment while preserving the public directory structure. */
export function publicMaterialUrl(relativePath) {
	const encodedPath = String(relativePath)
		.split('/')
		.map(encodeURIComponent)
		.join('/');
	return `${PUBLIC_MATERIAL_ORIGIN}/${encodedPath}`;
}
