//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publicStaticPageMetadata.mjs
 * @description Reads authored meaning from declared public static pages and supplies only deliberate fallbacks.
 * The Awtsmoos is the truth before every parser can start; Awtsmoos.com preserves authored voice while filling a missing part.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
	PUBLIC_STATIC_PATHS,
	PUBLIC_STATIC_ROUTES
} from './publicStaticRoutes/index.mjs';

/** Decodes the small HTML entity vocabulary used in title and description text. */
function decodeEntities(value) {
	return String(value || '')
		.replace(/&quot;/gi, '"')
		.replace(/&(?:apos|#39);/gi, "'")
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&amp;/gi, '&');
}

/** Reads one quoted attribute from an HTML tag. */
function attributeValue(tag, attribute) {
	const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const pattern = new RegExp(`\\b${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i');
	const match = tag.match(pattern);
	return match ? decodeEntities(match[1] ?? match[2] ?? '') : '';
}

/** Reads and normalizes the authored title. */
function authoredTitle(html) {
	const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
	if (!match) {
		return '';
	}
	return decodeEntities(match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

/** Reads the authored description independent of meta attribute order. */
function authoredDescription(html) {
	for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
		if (attributeValue(match[0], 'name').toLowerCase() === 'description') {
			return attributeValue(match[0], 'content').trim();
		}
	}
	return '';
}

/** Converts a canonical directory route to its static index file. */
function relativeFile(canonicalPath) {
	const clean = canonicalPath.replace(/^\/+|\/+$/g, '');
	return clean ? `${clean}/index.html` : 'index.html';
}

/** Builds one immutable record when the declared public file exists and has meaningful metadata. */
function pageRecord(geelooyRoot, route) {
	const relative = relativeFile(route.canonicalPath);
	const filePath = path.join(geelooyRoot, relative);
	if (!fs.existsSync(filePath)) {
		return null;
	}
	const html = fs.readFileSync(filePath, 'utf8');
	const title = authoredTitle(html) || route.fallbackTitle || '';
	const description = authoredDescription(html) || route.fallbackDescription || '';
	if (!title || !description) {
		return null;
	}
	return Object.freeze({
		canonicalPath: route.canonicalPath,
		description,
		filePath: relative,
		kind: 'public-information',
		title
	});
}

/** Returns every deliberately public static page whose file and metadata can be proven at build time. */
export function publicStaticPageRecords(geelooyRoot) {
	return PUBLIC_STATIC_ROUTES
		.map(route => pageRecord(geelooyRoot, route))
		.filter(Boolean);
}

export {
	PUBLIC_STATIC_PATHS as PUBLIC_INFORMATION_PATHS,
	attributeValue,
	authoredDescription,
	authoredTitle,
	relativeFile
};
