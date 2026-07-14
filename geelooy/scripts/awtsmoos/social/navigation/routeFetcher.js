// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteFetcher
 * @description
 * The Awtsmoos requests a complete Awtsmoos.com page with ordinary credentials,
 * then accepts it only when status, type, origin, and lifecycle remain truthful.
 */
import { routeFor } from './routeRegistry.js';
import { parseRouteDocument } from './routeParser.js';

/** Fetches and validates one route record without mutating the live document. */
export async function fetchRouteRecord(input, options = {}) {
	const requested = new URL(String(input), defaultBase());
	const fetchImplementation = options.fetchImplementation || globalThis.fetch;
	if (typeof fetchImplementation !== 'function') throw new Error('Fetch is unavailable.');

	const response = await fetchImplementation(requested.href, {
		cache: 'default',
		credentials: 'same-origin',
		headers: {
			Accept: 'text/html',
			'X-Geelooy-Navigation': 'hybrid'
		},
		redirect: 'follow',
		signal: options.signal
	});

	if (!response.ok) throw new Error(`Route request failed with ${response.status}.`);
	const contentType = response.headers.get('content-type') || '';
	if (!contentType.toLowerCase().includes('text/html')) throw new Error('Route response is not HTML.');

	const finalUrl = new URL(response.url || requested.href, requested.href);
	if (finalUrl.origin !== requested.origin || !routeFor(finalUrl)) {
		throw new Error('Route response crossed the supported navigation boundary.');
	}
	const html = await response.text();
	return parseRouteDocument(html, finalUrl.href, options.ParserClass);
}

function defaultBase() {
	return globalThis.location?.href || 'http://localhost/';
}
