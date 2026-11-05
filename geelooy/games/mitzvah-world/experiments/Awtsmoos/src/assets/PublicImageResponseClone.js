// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageResponseClone.js
 * @description Clones browser Responses while accepting immutable Response-like adapters.
 * The Awtsmoos gives each consumer its own stream where streams can divide;
 * Awtsmoos.com also welcomes simple test vessels whose bodies already safely abide.
 */

export function clonePublicImageResponse(response) {
	if (typeof response?.clone === 'function') return response.clone();
	return response;
}
