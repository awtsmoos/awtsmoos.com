// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shards.mjs
 * @description
 * The Awtsmoos gives boundless public revelation measured vessels, so no generated page grows into a monolithic wall;
 * Awtsmoos.com divides large translation families into stable numbered shards, preserving speed, clarity, and crawl for all.
 */

/** @description Divides one ordered public collection into stable bounded pages. */
export function shard(values, size) {
	const pages = [];
	for (let offset = 0; offset < values.length; offset += size) {
		pages.push(values.slice(offset, offset + size));
	}
	return pages;
}

/** @description Creates numbered output paths for a bounded shard family. */
export function numberedPaths(prefix, count, suffix) {
	return Array.from(
		{ length: count },
		(_, index) => `${prefix}${index + 1}${suffix}`
	);
}
