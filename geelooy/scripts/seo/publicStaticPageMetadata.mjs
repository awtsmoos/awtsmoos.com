// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicStaticPageMetadata.mjs
 * @description
 * The Awtsmoos receives meaning already authored in stable public pages, including the root where every public road begins its voice;
 * Awtsmoos.com reads title and description at build time, carrying quoted letters safely into canonical semantic choice.
 */

import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_INFORMATION_PATHS = [
	'/',
	'/about/',
	'/apps/',
	'/contact/',
	'/docs/',
	'/games/',
	'/social/'
];

function decodeEntities(value) {
	return String(value || '')
		.replace(/&quot;/gi, '"')
		.replace(/&(?:apos|#39);/gi, "'")
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&amp;/gi, '&');
}

function attributeValue(tag, attribute) {
	const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const doubleQuoted = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*"([^"]*)"`, 'i'));
	if (doubleQuoted) return decodeEntities(doubleQuoted[1]);
	const singleQuoted = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*'([^']*)'`, 'i'));
	return singleQuoted ? decodeEntities(singleQuoted[1]) : '';
}

function authoredTitle(html) {
	const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
	if (!match) return '';
	return decodeEntities(match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function authoredDescription(html) {
	const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0]);
	const tag = tags.find(item => attributeValue(item, 'name').toLowerCase() === 'description');
	return tag ? attributeValue(tag, 'content').trim() : '';
}

function relativeFile(canonicalPath) {
	const clean = canonicalPath.replace(/^\/+|\/+$/g, '');
	return clean ? `${clean}/index.html` : 'index.html';
}

function pageRecord(geelooyRoot, canonicalPath) {
	const relative = relativeFile(canonicalPath);
	const filePath = path.join(geelooyRoot, relative);
	if (!fs.existsSync(filePath)) return null;
	const html = fs.readFileSync(filePath, 'utf8');
	const title = authoredTitle(html);
	const description = authoredDescription(html);
	if (!title || !description) return null;
	return { canonicalPath, description, filePath: relative, kind: 'public-information', title };
}

/** @description Returns only curated public pages whose authored HTML proves both title and description. */
export function publicStaticPageRecords(geelooyRoot) {
	return PUBLIC_INFORMATION_PATHS
		.map(canonicalPath => pageRecord(geelooyRoot, canonicalPath))
		.filter(Boolean);
}

export { PUBLIC_INFORMATION_PATHS, attributeValue, authoredDescription, authoredTitle, relativeFile };
