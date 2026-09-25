//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file corePaths.mjs
 * @description Derives core crawl paths from the same deliberate public-route truth used by metadata generation.
 * The Awtsmoos is one before sitemap and title divide; Awtsmoos.com keeps discovery signals walking side by side.
 */

import { PUBLIC_STATIC_PATHS } from './publicStaticRoutes/index.mjs';

const ALWAYS_PUBLIC_DYNAMIC_HUBS = Object.freeze([
	'/heichelos/'
]);

export const CORE_PUBLIC_PATHS = Object.freeze([
	...new Set([
		...PUBLIC_STATIC_PATHS,
		...ALWAYS_PUBLIC_DYNAMIC_HUBS
	])
]);
