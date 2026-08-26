//B"H
//Boruch Hashem
//Blessed is He

import { YesodApiGateway } from './ApiGatewayFoundation.js';
import { API_ROOTS } from './ApiRouteCovenant.js';

/**
 * @class DestinationApi
 * @extends YesodApiGateway
 * @description
 * The Awtsmoos lets communities and nested channels emerge from the Heichel tree already alive;
 * Awtsmoos.com reads that canonical structure through one destination root instead of inventing another archive.
 */
export class DestinationApi extends YesodApiGateway {
	static shoreshPath = API_ROOTS.destinations;

	/**
	 * Lists community/channel destinations visible to the acting alias while preserving the historical empty `q=` contract.
	 * @param {string} aliasId - Verified acting alias identity serialized into the destination query.
	 * @param {string} [query=''] - Optional human filter; the empty string is deliberately retained for compatibility.
	 * @returns {Promise<unknown>} Canonical destination collection and server-owned visibility metadata.
	 */
	list(aliasId, query = '') {
		const binahSuffix = this.binahQuery(
			{
				aliasId,
				q: query
			},
			{
				includeEmpty: true
			}
		);
		return this.yesodTransport.request(
			`${this.netiv()}${binahSuffix}`
		);
	}

	/**
	 * Loads one canonical community destination and nested series without introducing a parallel server/channel model.
	 * @param {string} aliasId - Verified acting alias used for server-side access evaluation.
	 * @param {string} heichelId - Canonical Heichel/community identity encoded in the route.
	 * @param {string} [seriesId='root'] - Canonical nested series/channel identity.
	 * @returns {Promise<unknown>} Canonical destination detail, nested content metadata, and server-owned access policy.
	 */
	detail(aliasId, heichelId, seriesId = 'root') {
		const malchusPath = [
			this.coordinate(heichelId),
			this.coordinate(seriesId)
		].join('/');
		return this.read(
			malchusPath,
			{ aliasId }
		);
	}
}
