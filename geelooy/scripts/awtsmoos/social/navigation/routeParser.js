// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteParser
 * @description
 * The Awtsmoos separates one truthful Awtsmoos.com content vessel from a fetched
 * document. Ambiguous outlets and embedded scripts are rejected, never guessed.
 */
import { ROUTE_OUTLET_SELECTOR, routeFor } from './routeRegistry.js';

/** Parses and validates one complete same-origin route document. */
export function parseRouteDocument(html, sourceUrl, ParserClass = globalThis.DOMParser) {
	if (typeof ParserClass !== 'function') throw new Error('DOMParser is unavailable.');
	const route = routeFor(sourceUrl);
	if (!route) throw new Error('The fetched route has no registered lifecycle.');

	const parsed = new ParserClass().parseFromString(String(html), 'text/html');
	const titles = Array.from(parsed.querySelectorAll('title'));
	const title = titles.at(-1)?.textContent?.trim();
	const outlets = parsed.querySelectorAll(ROUTE_OUTLET_SELECTOR);
	if (!title) throw new Error('The fetched route has no trustworthy title.');
	if (outlets.length !== 1) throw new Error('The fetched route must expose exactly one outlet.');
	if (outlets[0].querySelector('script')) throw new Error('Route scripts require an explicit adapter.');

	return Object.freeze({
		sourceUrl: String(sourceUrl),
		title,
		routeId: route.id,
		outlet: outlets[0].cloneNode(true)
	});
}

/** Imports a fresh outlet clone into the live document. */
export function materializeRouteOutlet(record, root = document) {
	if (!record?.outlet?.matches?.(ROUTE_OUTLET_SELECTOR)) return null;
	return root.importNode(record.outlet, true);
}
