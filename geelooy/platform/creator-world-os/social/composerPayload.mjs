// B"H
// Boruch Hashem
// Blessed is He
/** @module ComposerPayload @description Builds safe structured social payloads without executable markup. */

/** Creates a normalized Rich Social Composer payload. */
export function createComposerPayload(input) {
	const title = requiredText(input?.title, 'title');
	const body = String(input?.body || '').trim();
	assertSafeText(title);
	assertSafeText(body);
	const sections = [...(input?.sections || [])];
	const assets = [...(input?.assets || [])];
	return Object.freeze({
		kind: input?.kind || 'post',
		title,
		body,
		sections: Object.freeze(sections),
		assets: Object.freeze(assets),
		tags: Object.freeze(uniqueText(input?.tags || [])),
		destination: input?.destination || null,
		visibility: input?.visibility || 'private'
	});
}

/** Rejects executable HTML while allowing ordinary punctuation and source text. */
export function assertSafeText(value) {
	const text = String(value || '');
	if (/<\s*script|javascript:|on[a-z]+\s*=/i.test(text)) {
		throw new TypeError('Executable markup is not allowed in social payloads.');
	}
	return text;
}

function requiredText(value, name) {
	const text = String(value || '').trim();
	if (!text) {
		throw new TypeError(`Composer ${name} is required.`);
	}
	return text;
}

function uniqueText(values) {
	return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}
