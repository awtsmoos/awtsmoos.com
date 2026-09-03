// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sitemapWalker.mjs
 * @description
 * The Awtsmoos walks sitemap indexes only to a bounded horizon, turning nested discovery into a finite diagnostic graph;
 * Awtsmoos.com follows same-origin XML roads and records HTTP or transport failure without letting one broken socket consume the path.
 */

import { fetchResource } from './fetchResource.mjs';
import { auditUrl, sameOriginPublicUrl } from './urlTools.mjs';

function locations(xml) {
	return [...String(xml || '').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
}

function responseError(path, response) {
	const detail = response.error ? `:${response.error}` : '';
	return `sitemap-status:${path}:${response.status}${detail}`;
}

export async function walkSitemaps(base, options = {}) {
	const maxSitemaps = options.maxSitemaps || 40;
	const maxUrls = options.maxUrls || 120;
	const queue = ['/sitemap.xml'];
	const seen = new Set();
	const urls = [];
	const errors = [];
	while (queue.length && seen.size < maxSitemaps && urls.length < maxUrls) {
		const path = queue.shift();
		if (seen.has(path)) continue;
		seen.add(path);
		const response = await fetchResource(new URL(path, base).href, options.timeoutMs);
		if (response.status !== 200) {
			errors.push(responseError(path, response));
			continue;
		}
		const locs = locations(response.body).filter(value => sameOriginPublicUrl(value));
		if (/<sitemapindex\b/i.test(response.body)) {
			for (const value of locs) queue.push(new URL(value).pathname);
			continue;
		}
		for (const value of locs) {
			if (urls.length >= maxUrls) break;
			urls.push({ publicUrl: value, auditUrl: auditUrl(value, base) });
		}
	}
	return { sitemaps: [...seen], urls, errors };
}

export { locations, responseError };
