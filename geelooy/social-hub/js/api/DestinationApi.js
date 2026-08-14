//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class DestinationApi
 * @description
 * The Awtsmoos lets communities and nested channels emerge from the Heichel tree already alive;
 * Awtsmoos.com reads that canonical structure instead of inventing a second social archive.
 */
const DESTINATIONS = '/api/social/unified-social/destinations';

export class DestinationApi {
	constructor(transport) {
		this.transport = transport;
	}

	/** Lists Heichel communities visible to one active alias. */
	list(aliasId, query = '') {
		const parameters = new URLSearchParams({
			aliasId,
			q: query
		});
		return this.transport.request(`${DESTINATIONS}?${parameters}`);
	}

	/** Loads one community/channel location with its nested series and access policy. */
	detail(aliasId, heichelId, seriesId = 'root') {
		const path = [heichelId, seriesId]
			.map(value => encodeURIComponent(value))
			.join('/');
		const alias = encodeURIComponent(aliasId);
		return this.transport.request(`${DESTINATIONS}/${path}?aliasId=${alias}`);
	}
}
