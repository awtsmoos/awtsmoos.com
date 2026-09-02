// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file artifactPlan.mjs
 * @description
 * The Awtsmoos arranges public worlds into bounded crawl vessels before any generated file is written;
 * Awtsmoos.com ties each artifact to real registries and corpus manifests, so discovery stays fresh, measurable, and unwritten by guess.
 */

import path from 'node:path';
import { createRequire } from 'node:module';
import { applicationEntries, catalogPaths } from './catalogPaths.mjs';
import { renderCatalogPage } from './catalogHtml.mjs';
import { numberedPaths, shard } from './shards.mjs';
import { translationEntries } from './translationCatalog.mjs';
import { translationPaths } from './translationPaths.mjs';

const require = createRequire(import.meta.url);
const { renderSitemapIndex, renderUrlSet } = require('../../seo/xml.js');

const TRANSLATION_SITEMAP_SIZE = 80;
const TRANSLATION_CATALOG_SIZE = 24;
const ROOT_SITEMAPS = [
	'/sitemaps/core.xml',
	'/heichelos/sitemap.xml',
	'/@/sitemap.xml',
	'/comments/sitemap.xml',
	'/translations-sitemap.xml',
	'/apps/sitemap.xml',
	'/games/sitemap.xml'
];

function robotsText() {
	return [
		'# B"H',
		'# Boruch Hashem',
		'# Blessed is He',
		"# The Awtsmoos opens public semantic roads while action APIs remain outside the crawler's thread.",
		'User-agent: *',
		'Allow: /',
		'Disallow: /api/',
		'',
		'Sitemap: https://awtsmoos.com/sitemap.xml'
	].join('\n');
}

function translationArtifacts(paths) {
	const artifacts = {};
	const sitemapPages = shard(paths, TRANSLATION_SITEMAP_SIZE);
	const sitemapPaths = numberedPaths('/translations/sitemap-', sitemapPages.length, '.xml');
	sitemapPages.forEach((page, index) => {
		artifacts[`translations/sitemap-${index + 1}.xml`] = renderUrlSet(page);
	});
	const entries = translationEntries(paths);
	const catalogPages = shard(entries, TRANSLATION_CATALOG_SIZE);
	const catalogPaths = numberedPaths('/translations/catalog-', catalogPages.length, '.html');
	catalogPages.forEach((page, index) => {
		artifacts[`translations/catalog-${index + 1}.html`] = renderCatalogPage({
			entries: page,
			basePath: '/',
			title: `English Torah Translations — page ${index + 1}`,
			description: 'Public English Torah translations with Hebrew source context on Awtsmoos.com.',
			canonicalPath: catalogPaths[index]
		});
	});
	const indexEntries = catalogPaths.map((href, index) => ({
		id: `translation-catalog-${index + 1}`,
		title: `Translation catalog page ${index + 1}`,
		description: `Browse English Torah translations, page ${index + 1}.`,
		href
	}));
	artifacts['translations/index.html'] = renderCatalogPage({
		entries: indexEntries,
		basePath: '/',
		title: 'English Torah Translations',
		description: 'Browse public English Torah translations with Hebrew source context.',
		canonicalPath: '/translations/'
	});
	artifacts['translations-sitemap.xml'] = renderSitemapIndex(sitemapPaths);
	return artifacts;
}

export function buildArtifactPlan({ geelooyRoot, apps, games }) {
	const importedRoot = path.join(geelooyRoot, 'api/social/helper/comments/imported/data');
	const translations = translationPaths(importedRoot);
	const publicApps = applicationEntries(apps);
	const appPaths = ['/apps/catalog.html', ...catalogPaths(publicApps, '/apps/')];
	const gamePaths = ['/games/catalog.html', ...catalogPaths(games, '/games/')];
	return {
		'robots.txt': robotsText(),
		'sitemap.xml': renderSitemapIndex(ROOT_SITEMAPS),
		'sitemaps/core.xml': renderUrlSet(['/', '/heichelos', '/apps/', '/apps/catalog.html', '/games/', '/games/catalog.html', '/translations/']),
		'apps/sitemap.xml': renderUrlSet(appPaths),
		'games/sitemap.xml': renderUrlSet(gamePaths),
		'apps/catalog.html': renderCatalogPage({ entries: publicApps, basePath: '/apps/', title: 'Awtsmoos Applications', description: 'Public applications and tools on Awtsmoos.com.', canonicalPath: '/apps/catalog.html' }),
		'games/catalog.html': renderCatalogPage({ entries: games, basePath: '/games/', title: 'Awtsmoos Games', description: 'Public games and interactive worlds on Awtsmoos.com.', canonicalPath: '/games/catalog.html' }),
		...translationArtifacts(translations)
	};
}

export { ROOT_SITEMAPS, TRANSLATION_CATALOG_SIZE, TRANSLATION_SITEMAP_SIZE };
