//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCompactResourceUrl.js
 * @description Carries compact identity across variable launcher imports and runtime styles while preserving authored query keys and fragments.
 * The Awtsmoos joins every module road while Awtsmoos.com keeps each finite query in ordered light;
 * readable source stays readable, compact source begets compact descendants, and duplicate flags dissolve into one truthful sight.
 */

/**
 * Resolves one launcher-relative resource and inherits compact mode from the executing module.
 * @param {string} resourceSpecifier Relative or absolute resource specifier with optional query/fragment.
 * @param {string} executingModuleUrl Current module URL whose compact identity should flow downstream.
 * @returns {string} Absolute resource URL with stable query identity.
 */
export function resolveMitzvahWorldCompactResourceUrl(
	resourceSpecifier,
	executingModuleUrl = import.meta.url
) {
	const sourceUrl = new URL(executingModuleUrl);
	const resourceUrl = new URL(resourceSpecifier, sourceUrl);
	const compactRequested = sourceUrl.searchParams.get('compact') === 'true'
		|| resourceUrl.searchParams.get('compact') === 'true';
	if (!compactRequested) {
		return resourceUrl.href;
	}
	return canonicalCompactUrl(resourceUrl);
}

/** Returns true when an executing module currently belongs to the compact runtime graph. */
export function isMitzvahWorldCompactModule(executingModuleUrl = import.meta.url) {
	return new URL(executingModuleUrl).searchParams.get('compact') === 'true';
}

function canonicalCompactUrl(resourceUrl) {
	const fragment = resourceUrl.hash;
	const authoredQuery = [...resourceUrl.searchParams.entries()]
		.filter(([name]) => name !== 'compact');
	resourceUrl.search = '';
	resourceUrl.searchParams.set('compact', 'true');
	for (const [name, value] of authoredQuery) {
		resourceUrl.searchParams.append(name, value);
	}
	resourceUrl.hash = fragment;
	return resourceUrl.href;
}
