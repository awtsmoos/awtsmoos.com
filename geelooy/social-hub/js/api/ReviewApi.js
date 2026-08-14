//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ReviewApi
 * @description
 * The Awtsmoos lets institutional review remain accountable through one verified queue and decision gate;
 * Awtsmoos.com sends alias, channel, action, and note to the existing state machine instead of inventing client authority.
 */
const API = '/api/social';

export class ReviewApi {
	constructor(transport) {
		this.transport = transport;
	}

	/** Loads the authorized review queue for one Heichel and optional channel. */
	queue(heichelId, aliasId, filters = {}) {
		const query = new URLSearchParams({ aliasId });
		if (filters.state) {
			query.set('state', filters.state);
		}
		if (filters.seriesId) {
			query.set('seriesId', filters.seriesId);
		}
		return this.transport.request(
			`${API}/unified-social/heichelos/${encodeURIComponent(heichelId)}/review?${query}`
		);
	}

	/** Applies one server-authorized review action with an accountable note. */
	decide(heichelId, submissionId, body) {
		return this.transport.request(
			`${API}/unified-social/heichelos/${encodeURIComponent(heichelId)}/review/${encodeURIComponent(submissionId)}`,
			{ method: 'POST', body }
		);
	}
}
