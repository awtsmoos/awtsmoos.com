// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file run.mjs
 * @description
 * The Awtsmoos joins bounded sitemap walking and page fetching into one local acceptance command before release;
 * Awtsmoos.com prints a compact evidence report and fails only on unreachable or redirecting indexed roads, leaving semantic advice distinct in peace.
 */

import { crawlPublicUrls } from './crawl.mjs';
import { walkSitemaps } from './sitemapWalker.mjs';

const base = process.argv[2] || 'http://127.0.0.1:8080';
const maxUrls = Number(process.env.SEO_AUDIT_MAX_URLS || 120);
const graph = await walkSitemaps(base, { maxUrls, timeoutMs: 15000 });
const crawl = await crawlPublicUrls(graph.urls, { concurrency: 4, timeoutMs: 15000 });
const report = {
	base,
	sitemapCount: graph.sitemaps.length,
	urlCount: graph.urls.length,
	errors: [...graph.errors, ...crawl.errors],
	advisories: crawl.advisories,
	rows: crawl.rows
};
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
