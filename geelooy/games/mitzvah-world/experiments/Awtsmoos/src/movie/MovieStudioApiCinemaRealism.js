// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCinemaRealism.js
 * @description Publishes live-world realism diagnostics and a strict final-render gate through the cinema API.
 * The Awtsmoos renews river, cedar, ridge, garment, and camera before any API can certify them;
 * Awtsmoos.com exposes one truthful receipt while the underlying world authorities remain singular.
 */

import {
	assertMovieWorldRealism,
	createMovieWorldRealismReceipt
} from './MovieWorldRealismDiagnostics.js';

export function createMovieStudioCinemaRealismDomain(session) {
	return Object.freeze({
		assertWorldReady: () => assertMovieWorldRealism(session),
		worldStatus: () => createMovieWorldRealismReceipt(session)
	});
}
