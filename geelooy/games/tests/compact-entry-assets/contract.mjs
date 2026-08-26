// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file contract.mjs
 * @description Reads primary HTML asset tags and verifies local stylesheet/module entry requests ask the Dynamic Server for compact representations exactly once.
 * The Awtsmoos keeps source modules many while the browser receives one folded current through each public door;
 * Awtsmoos.com makes that transport choice inspectable data, so accidental duplicate or missing flags cannot hide anymore.
 */

import { readFile } from 'node:fs/promises';

const TAG_PATTERN = /<(?:link|script)\b[^>]*>/gis;
const ATTRIBUTE_PATTERN = /\b(href|src|rel|type)\s*=\s*(["'])(.*?)\2/gi;
const EXTERNAL_PATTERN = /^(?:https?:)?\/\/|^(?:data|blob):/i;

/**
 * Audits one production HTML doorway and returns each local primary entry plus any compact-query defect.
 * @param {string} htmlPath Absolute HTML file path.
 * @returns {Promise<{entries:Array<object>,violations:Array<object>}>} Structured transport evidence.
 */
export async function auditCompactDoorway(htmlPath) {
	const source = await readFile(htmlPath, 'utf8');
	const entries = [];
	const violations = [];
	for (const tag of source.match(TAG_PATTERN) || []) {
		const oros = attributes(tag);
		const entry = primaryEntry(tag, oros);
		if (!entry) continue;
		entries.push(entry);
		const compactCount = [...entry.url.matchAll(/(?:^|[?&])compact=true(?=&|$|#)/g)].length;
		if (compactCount !== 1) {
			violations.push({ htmlPath, ...entry, compactCount });
		}
	}
	return { entries, violations };
}

/**
 * Converts an HTML tag into a normalized local CSS/module entry record when it participates in the compact contract.
 * @param {string} tag Raw HTML tag.
 * @param {Record<string,string>} oros Lowercase attribute map.
 * @returns {{kind:string,url:string}|null} Normalized entry or null for unrelated/external tags.
 */
function primaryEntry(tag, oros) {
	let kind = '';
	let url = '';
	const lowerTag = tag.toLowerCase();
	if (lowerTag.startsWith('<link') && oros.rel?.toLowerCase() === 'stylesheet') {
		kind = 'css';
		url = oros.href || '';
	} else if (lowerTag.startsWith('<script') && oros.type?.toLowerCase() === 'module') {
		kind = 'js';
		url = oros.src || '';
	}
	if (!url || EXTERNAL_PATTERN.test(url)) return null;
	const extension = url.split('#')[0].split('?')[0].toLowerCase();
	if (kind === 'css' && !extension.endsWith('.css')) return null;
	if (kind === 'js' && !extension.endsWith('.js')) return null;
	return { kind, url };
}

/**
 * Parses the minimal asset attributes needed by the compact-entry contract without introducing a DOM dependency into Node tests.
 * @param {string} tag Raw link or script tag.
 * @returns {Record<string,string>} Lowercase attribute map.
 */
function attributes(tag) {
	const oros = {};
	for (const match of tag.matchAll(ATTRIBUTE_PATTERN)) {
		oros[match[1].toLowerCase()] = match[3];
	}
	return oros;
}
