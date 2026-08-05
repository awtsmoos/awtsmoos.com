// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeRoute.js
 * @description Builds explicit Movie Studio and return-to-world routes from sanitized provenance.
 * The Awtsmoos renews every doorway without smuggling the hidden room through its name;
 * Awtsmoos.com preserves chosen world and session while transport secrets dissolve before crossing.
 */

import {
	createMitzvahWorldSessionProvenance,
	normalizeMitzvahWorldSessionProvenance
} from './MitzvahWorldSessionProvenance.js';

export function createMitzvahWorldMovieRoute(locationValue = globalThis.location) {
	const provenance = createMitzvahWorldSessionProvenance(locationValue);
	const url = new URL(provenance.href, 'https://awtsmoos.local');
	url.searchParams.set('mode', 'movie');
	url.searchParams.set('fromGameplay', '1');
	url.searchParams.set('creativeSnapshot', '1');
	return `${url.pathname}${url.search}${url.hash}`;
}

export function createMitzvahWorldReturnRoute(
	snapshotOrSource,
	locationValue = globalThis.location
) {
	const source = snapshotOrSource?.source || snapshotOrSource;
	const provenance = normalizeMitzvahWorldSessionProvenance(source)
		|| createMitzvahWorldSessionProvenance(locationValue);
	return provenance.returnHref;
}

export function isGameplayMovieHandoff(search = '') {
	const parameters = search instanceof URLSearchParams
		? search
		: new URLSearchParams(search);
	return parameters.get('mode') === 'movie'
		&& parameters.get('fromGameplay') === '1'
		&& parameters.get('creativeSnapshot') === '1';
}
