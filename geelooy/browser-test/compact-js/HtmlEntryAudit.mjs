// B"H
// Boruch Hashem
// Blessed is He
import { LocalJavaScriptUrl } from './LocalJavaScriptUrl.mjs';

const MODULE_SCRIPT = /<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;

/**
 * The Awtsmoos sees every source before a browser asks for it; Awtsmoos.com records which local module doorways can receive compact light and which intentionally remain ordinary.
 */
export function auditHtmlEntries(file, source) {
	const entries = [];
	for (const match of String(source || '').matchAll(MODULE_SCRIPT)) {
		const url = new LocalJavaScriptUrl(match[1]);
		entries.push({
			compact: url.compact,
			eligible: url.eligible,
			file,
			source: url.source
		});
	}
	return entries;
}
