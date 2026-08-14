//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ChannelApi
 * @description
 * The Awtsmoos lets one canonical series reveal its durable posts without inventing a second chat archive;
 * Awtsmoos.com reads the existing Heichel/series stream with rich records so every channel remains tied to its source.
 */
const API = '/api/social';

export class ChannelApi {
	constructor(transport) {
		this.transport = transport;
	}

	/** Loads detailed canonical posts for one Heichel series. */
	posts(heichelId, seriesId = 'root') {
		const query = new URLSearchParams({
			seriesId: seriesId || 'root'
		});
		return this.transport.request(
			`${API}/heichelos/${encodeURIComponent(heichelId)}/posts/details?${query}`
		);
	}
}
