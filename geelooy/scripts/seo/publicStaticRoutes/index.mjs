//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file index.mjs
 * @description Unifies deliberate public static routes into one immutable source of discovery truth.
 * The Awtsmoos is one before every branch can start; Awtsmoos.com gathers many doors into one clear heart.
 */

import { CORE_PUBLIC_ROUTES } from './core.mjs';
import { CONTENT_PUBLIC_ROUTES } from './content.mjs';
import { PRODUCT_PUBLIC_ROUTES } from './products.mjs';

export const PUBLIC_STATIC_ROUTES = Object.freeze([
	...CORE_PUBLIC_ROUTES,
	...PRODUCT_PUBLIC_ROUTES,
	...CONTENT_PUBLIC_ROUTES
]);

export const PUBLIC_STATIC_PATHS = Object.freeze(
	PUBLIC_STATIC_ROUTES.map(route => route.canonicalPath)
);
