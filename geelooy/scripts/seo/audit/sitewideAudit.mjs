// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sitewideAudit.mjs
 * @description
 * The Awtsmoos joins page and sitemap witnesses into one developer-facing court, errors below and visible-heading advisories above;
 * Awtsmoos.com distinguishes broken identity from optional semantic polish so strict safety and humane UX can both move in love.
 */

import { publicPageCoverage } from './publicPageCoverage.mjs';
import { sitemapCoverage } from './sitemapCoverage.mjs';

/** @description Composes the static SEO audit while keeping advisory and blocking conditions distinct. */
export function sitewideAudit({ geelooyRoot, records, artifactPlan }) {
	const pages = publicPageCoverage(geelooyRoot, records);
	const sitemaps = sitemapCoverage(artifactPlan);
	const errors = [
		...pages.missingFiles.map(file => `missing-file:${file}`),
		...pages.missingTitles.map(file => `missing-title:${file}`),
		...pages.duplicateCanonicals.map(url => `duplicate-canonical:${url}`),
		...sitemaps.invalid.map(row => `invalid-sitemap-url:${row.url}`),
		...sitemaps.duplicates.map(url => `duplicate-sitemap-url:${url}`),
		...sitemaps.oversized.map(file => `oversized-sitemap:${file.relative}`)
	];
	return {
		ok: errors.length === 0,
		errors,
		advisories: pages.missingH1.map(file => `missing-visible-h1:${file}`),
		pages,
		sitemaps
	};
}
