// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosApiDescriptor.js
 * @description Normalizes one public API operation into a small immutable, serializable vessel that can feed code, tests, docs, and UI from the same truth.
 * The Awtsmoos gives intention no body of its own, yet Awtsmoos.com lets each command receive a measured keli;
 * path, domain, safety, tags, and summary become one clear garment, so future expansion can multiply light without multiplying mystery.
 */

/**
 * Creates one deeply stable public operation descriptor.
 *
 * The descriptor is Binah: raw executable possibility becomes structured understanding before any caller is allowed to depend on it.
 * No live function reference is stored here; behavior remains an ohr outside this serializable keli, preserving clean data contracts for agents and UI.
 *
 * @param {object} descriptorKli Raw descriptor-like values supplied by a domain catalog or method inventory.
 * @param {string} descriptorKli.path Dot-delimited public operation path.
 * @param {string} [descriptorKli.id] Stable operation id; defaults to `path`.
 * @param {string} [descriptorKli.domain] Logical API domain; defaults to the first path segment.
 * @param {string} [descriptorKli.summary] Human-readable operation purpose.
 * @param {number} [descriptorKli.arity=0] Declared positional argument count.
 * @param {boolean} [descriptorKli.async=false] Whether the discovered implementation is asynchronous.
 * @param {boolean} [descriptorKli.unsafe=false] Whether invocation requires explicit unsafe authority.
 * @param {string[]} [descriptorKli.tags=[]] Searchable capability labels.
 * @returns {Readonly<object>} Frozen, serializable descriptor record.
 * @throws {TypeError} When no non-empty public path is supplied.
 */
export function createAwtsmoosApiDescriptor(descriptorKli = {}) {
	const pathOhr = normalizedText(descriptorKli.path);
	if (!pathOhr) {
		throw new TypeError('Awtsmoos API descriptors require a non-empty path.');
	}
	const domainSefirah = normalizedText(descriptorKli.domain)
		|| pathOhr.split('.')[0]
		|| 'api';
	const tagsOros = normalizedTags(descriptorKli.tags);
	const publicKli = {
		arity: normalizedArity(descriptorKli.arity),
		async: Boolean(descriptorKli.async),
		domain: domainSefirah,
		id: normalizedText(descriptorKli.id) || pathOhr,
		path: pathOhr,
		summary: normalizedText(descriptorKli.summary) || `Invoke ${pathOhr}.`,
		tags: tagsOros,
		unsafe: Boolean(descriptorKli.unsafe)
	};
	return Object.freeze(publicKli);
}

/**
 * Converts arbitrary text-like input into one trimmed string without leaking `null` or `undefined` into public contracts.
 * @param {*} rawOhr Any candidate textual value.
 * @returns {string} Trimmed text or the empty string.
 */
function normalizedText(rawOhr) {
	return typeof rawOhr === 'string' ? rawOhr.trim() : '';
}

/**
 * Freezes a deduplicated list of non-empty textual tags so search metadata cannot mutate after catalog publication.
 * @param {*} rawOros Candidate tag collection.
 * @returns {ReadonlyArray<string>} Stable tag list preserving first-seen order.
 */
function normalizedTags(rawOros) {
	const tagOros = Array.isArray(rawOros) ? rawOros : [];
	const revealedTags = tagOros
		.map(normalizedText)
		.filter(Boolean);
	return Object.freeze([...new Set(revealedTags)]);
}

/**
 * Normalizes declared function arity into a safe non-negative integer for serialized method discovery.
 * @param {*} rawArity Candidate arity.
 * @returns {number} Non-negative integer arity.
 */
function normalizedArity(rawArity) {
	const measuredGevurah = Number(rawArity);
	return Number.isFinite(measuredGevurah)
		? Math.max(0, Math.trunc(measuredGevurah))
		: 0;
}
