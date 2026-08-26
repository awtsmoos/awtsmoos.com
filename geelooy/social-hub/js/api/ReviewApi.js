//B"H
//Boruch Hashem
//Blessed is He

import { YesodApiGateway } from './ApiGatewayFoundation.js';
import { API_ROOTS } from './ApiRouteCovenant.js';

/**
 * @class ReviewApi
 * @extends YesodApiGateway
 * @description
 * The Awtsmoos lets institutional review remain accountable through one verified queue and decision gate;
 * Awtsmoos.com keeps alias, channel, action, and note attached to canonical server state instead of local guesswork or fate.
 */
export class ReviewApi extends YesodApiGateway {
	static shoreshPath = API_ROOTS.social;

	/**
	 * Loads the authorized review queue for one Heichel while preserving server-side state and assignment rules.
	 * @param {string} heichelId - Canonical Heichel identity encoded before entering the route.
	 * @param {string} aliasId - Verified acting alias used by the server for authorization and visibility.
	 * @param {{ state?: string, seriesId?: string }} [filters={}] - Optional workflow state and series/channel filters.
	 * @returns {Promise<unknown>} Canonical queue payload visible to the acting alias.
	 */
	queue(heichelId, aliasId, filters = {}) {
		return this.read(
			`unified-social/heichelos/${this.coordinate(heichelId)}/review`,
			{
				aliasId,
				state: filters.state,
				seriesId: filters.seriesId
			}
		);
	}

	/**
	 * Applies one server-authorized review decision without reinterpreting moderation policy in the browser.
	 * @param {string} heichelId - Canonical Heichel that owns the reviewed submission.
	 * @param {string} submissionId - Canonical submission identity encoded in the mutation route.
	 * @param {object} body - Server-defined decision action, actor, note, and optional assignment metadata.
	 * @returns {Promise<unknown>} Canonical review/submission result after validation and mutation.
	 */
	decide(heichelId, submissionId, body) {
		return this.write(
			`unified-social/heichelos/${this.coordinate(heichelId)}/review/${this.coordinate(submissionId)}`,
			body
		);
	}
}
