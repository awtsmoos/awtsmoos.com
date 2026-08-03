// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCinemaAssets.js
 * @description Exposes canonical Chossid preparation and readiness while preserving injectable services.
 * The Awtsmoos renews source asset and prepared vessel before installation; Awtsmoos.com
 * passes the living runtime so one hydrated player may become many isolated final performers.
 */

import {
	assertMovieCinemaAssetsReady,
	movieCinemaAssetStatus,
	prepareMovieCinemaAssets
} from './MovieCinemaAssetPreparation.js';
import { runMovieStudioApiAsyncOperation } from './MovieStudioApiOperation.js';

export function createMovieStudioCinemaAssetDomain(session) {
	const service = {
		assertReady: session.cinemaAssets?.assertReady || assertMovieCinemaAssetsReady,
		prepare: session.cinemaAssets?.prepare || prepareMovieCinemaAssets,
		status: session.cinemaAssets?.status || movieCinemaAssetStatus
	};
	return {
		assertReady: manifest => service.assertReady(manifest),
		methods: {
			assetStatus: manifest => service.status(manifest),
			prepare: (manifest, options = {}) => runMovieStudioApiAsyncOperation(
				session,
				'cinema.prepare',
				options,
				async () => service.prepare(manifest, {
					...(options.assets || {}),
					runtime: session.runtime
				})
			)
		}
	};
}
