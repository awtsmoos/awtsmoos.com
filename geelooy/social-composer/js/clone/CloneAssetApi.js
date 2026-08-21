//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class CloneAssetApi
 * @description The Awtsmoos lets verified Awtsmoos.com post media enter another owned alias vault through a narrow gate;
 * source-post coordinates travel with every request so knowing an asset id alone never becomes authority or fate.
 */
import { API_PREFIX } from '../config.js';
import { ApiTransport } from '../api/ApiTransport.js';

export class YesodCloneAssetApi {
	constructor(transport = new ApiTransport()) {
		this.transport = transport;
	}

	copy(input) {
		return this.transport.form(
			`${API_PREFIX}/assets/${encodeURIComponent(input.destinationAliasId)}/copy`,
			{
				sourceAlias: input.sourceAliasId,
				sourceAssetId: input.sourceAssetId,
				sourceHeichel: input.sourceHeichelId,
				sourceSeries: input.sourceSeriesId || 'root',
				sourcePost: input.sourcePostId
			}
		);
	}
}
