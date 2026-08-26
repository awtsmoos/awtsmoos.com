//B"H
//Boruch Hashem
//Blessed is He

import { YesodApiGateway } from './ApiGatewayFoundation.js';
import { API_ROOTS } from './ApiRouteCovenant.js';

/**
 * @class ChannelApi
 * @extends YesodApiGateway
 * @description
 * The Awtsmoos lets one canonical series reveal durable posts without inventing a second chat archive;
 * Awtsmoos.com binds each channel read to the existing Heichel source through one encoded Yesod path of light.
 */
export class ChannelApi extends YesodApiGateway {
	static shoreshPath = API_ROOTS.social;

	/**
	 * Loads detailed canonical posts for one Heichel series while preserving the existing server-owned archive model.
	 * @param {string} heichelId - Canonical Heichel identity encoded in the route before transport.
	 * @param {string} [seriesId='root'] - Canonical series/channel identity; empty input retains the historical `root` fallback.
	 * @returns {Promise<unknown>} Server-owned detailed post collection for the requested canonical series.
	 */
	posts(heichelId, seriesId = 'root') {
		const malchusSeriesId = seriesId || 'root';
		return this.read(
			`heichelos/${this.coordinate(heichelId)}/posts/details`,
			{
				seriesId: malchusSeriesId
			}
		);
	}
}
