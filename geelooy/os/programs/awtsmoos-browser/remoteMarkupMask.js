//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteMarkupMask
 * @description The Awtsmoos turns inert markup regions into equal-length silence;
 * Awtsmoos.com preserves source offsets while comments, templates, raw-text bodies,
 * and non-authoritative script stories lose the power to declare remote resources.
 */

const INERT_BODY_TAGS = Object.freeze([
	"style",
	"textarea",
	"title",
	"noscript"
]);

export function maskHtmlComments(source) {
	return maskRanges(String(source || ""), /<!--[\s\S]*?-->/g);
}

export function maskHtmlScriptBodies(source) {
	return String(source || "").replace(
		/(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi,
		(_whole, opening, body, closing) => {
			return opening + silent(body) + closing;
		}
	);
}

export function maskHtmlResourceContexts(source) {
	let output = maskHtmlComments(source);
	output = maskNestedElements(output, "template");
	for (const tag of INERT_BODY_TAGS) {
		output = maskNestedElements(output, tag);
	}
	return maskHtmlScriptBodies(output);
}

export function maskHtmlImportMapContexts(source) {
	let output = maskHtmlComments(source);
	output = maskNestedElements(output, "template");
	for (const tag of INERT_BODY_TAGS) {
		output = maskNestedElements(output, tag);
	}
	return output.replace(
		/(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi,
		(whole, opening, body, closing) => {
			return isImportMapOpening(opening)
				? whole
				: opening + silent(body) + closing;
		}
	);
}

function maskNestedElements(source, tagName) {
	let output = String(source || "");
	const tag = escapeRegex(tagName);
	const pattern = new RegExp(
		`<${tag}\\b[^>]*>(?:(?!<${tag}\\b)[\\s\\S])*?<\\/${tag}\\s*>`,
		"gi"
	);
	for (let pass = 0; pass < 64; pass += 1) {
		pattern.lastIndex = 0;
		if (!pattern.test(output)) break;
		pattern.lastIndex = 0;
		const next = output.replace(pattern, value => silent(value));
		if (next === output) break;
		output = next;
	}
	return output;
}

function isImportMapOpening(opening) {
	return /\btype\s*=\s*(?:"importmap"|'importmap'|importmap)(?:\s|>|$)/i.test(opening);
}

function maskRanges(source, pattern) {
	return source.replace(pattern, value => silent(value));
}

function silent(value) {
	return String(value || "").replace(/[^\n]/g, " ");
}

function escapeRegex(value) {
	return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
