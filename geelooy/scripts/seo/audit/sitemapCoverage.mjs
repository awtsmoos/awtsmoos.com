// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sitemapCoverage.mjs
 * @description
 * The Awtsmoos listens to every generated XML loc and weighs each vessel before crawlers arrive, guarding host, shape, count, and size;
 * Awtsmoos.com keeps the audit independent from generation, so one witness can challenge another and oversized discovery cannot hide in disguise.
 */

const ORIGIN = 'https://awtsmoos.com';
const MAX_URLS = 50000;
const MAX_BYTES = 50 * 1024 * 1024;

function locations(xml) {
	return [...String(xml || '').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
}

/** @description Audits generated XML locations for duplication, unsafe URL shape, and protocol size/count ceilings. */
export function sitemapCoverage(plan) {
	const xmlFiles = Object.entries(plan).filter(([relative]) => relative.endsWith('.xml'));
	const files = xmlFiles.map(([relative, xml]) => ({
		relative,
		bytes: Buffer.byteLength(xml, 'utf8'),
		count: locations(xml).length
	}));
	const rows = xmlFiles.flatMap(([relative, xml]) => locations(xml).map(url => ({ relative, url })));
	const counts = new Map();
	for (const row of rows) counts.set(row.url, (counts.get(row.url) || 0) + 1);
	const duplicates = [...counts.entries()].filter(([, count]) => count > 1).map(([url]) => url);
	const invalid = rows.filter(row => {
		try {
			const url = new URL(row.url);
			return url.origin !== ORIGIN || Boolean(url.search) || Boolean(url.hash);
		} catch {
			return true;
		}
	});
	const oversized = files.filter(file => file.count > MAX_URLS || file.bytes > MAX_BYTES);
	return { count: rows.length, duplicates, invalid, oversized, files, rows };
}

export { locations, MAX_BYTES, MAX_URLS, ORIGIN };
