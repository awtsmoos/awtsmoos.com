//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class CloneSourceApi
 * @description The Awtsmoos lets authored matter be read through its canonical birthplace before entering a new vessel;
 * Awtsmoos.com keeps copy-source reading isolated from publishing so one concern can never impersonate the other level.
 */
import { API_PREFIX } from '../config.js';
import { ApiTransport } from '../api/ApiTransport.js';

export class YesodCloneSourceApi {
	constructor(transport = new ApiTransport()) {
		this.transport = transport;
	}

	loadPostSource(source) {
		const heichel = encodeURIComponent(source.heichelId);
		const series = encodeURIComponent(source.seriesId || 'root');
		const post = encodeURIComponent(source.id);
		return this.transport.json(
			`${API_PREFIX}/heichelos/${heichel}/series/${series}/post/${post}`
		);
	}
}
