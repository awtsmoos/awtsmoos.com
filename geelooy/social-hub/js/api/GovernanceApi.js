//B"H
//Boruch Hashem
//Blessed is He

import { YesodApiGateway } from './ApiGatewayFoundation.js';
import { API_ROOTS } from './ApiRouteCovenant.js';

/**
 * @class GovernanceApi
 * @extends YesodApiGateway
 * @description
 * The Awtsmoos lets role, invitation, hierarchy, and consent remain guarded by canonical Heichel authority;
 * Awtsmoos.com carries verified alias intent through one Yesod gate and never mistakes client convenience for sovereignty.
 */
export class GovernanceApi extends YesodApiGateway {
	static shoreshPath = API_ROOTS.unifiedSocial;

	/**
	 * Loads server-declared governance capabilities and institutional metadata without synthesizing client policy.
	 * @returns {Promise<unknown>} Canonical governance capability metadata for the current authenticated context.
	 */
	meta() {
		return this.read('governance/meta');
	}

	/**
	 * Loads governance state for one Heichel and one acting alias while preserving server authority over roles and access.
	 * @param {string} heichelId - Canonical Heichel identity encoded at the path boundary.
	 * @param {string} aliasId - Verified acting alias identity serialized as query context.
	 * @returns {Promise<unknown>} Canonical membership, role, invitation, and governance state visible to the actor.
	 */
	overview(heichelId, aliasId) {
		return this.read(
			`heichelos/${this.coordinate(heichelId)}/governance`,
			{ aliasId }
		);
	}

	/**
	 * Applies one server-authorized membership role mutation without duplicating authorization rules in the browser.
	 * @param {string} heichelId - Canonical Heichel whose member role is changing.
	 * @param {string} memberAliasId - Canonical member alias encoded in the resource path.
	 * @param {object} body - Existing server-defined role mutation payload and accountability context.
	 * @returns {Promise<unknown>} Server-owned membership/governance result after authorization and mutation.
	 */
	setRole(heichelId, memberAliasId, body) {
		return this.write(
			`heichelos/${this.coordinate(heichelId)}/members/${this.coordinate(memberAliasId)}`,
			body
		);
	}

	/**
	 * Creates one consent-oriented governance invitation through the canonical Heichel invitation state machine.
	 * @param {string} heichelId - Canonical Heichel issuing the invitation.
	 * @param {object} body - Existing server-defined invitee, role, actor, and optional context payload.
	 * @returns {Promise<unknown>} Server-owned invitation record or acknowledgment.
	 */
	invite(heichelId, body) {
		return this.write(
			`heichelos/${this.coordinate(heichelId)}/invitations`,
			body
		);
	}

	/**
	 * Records an invitee response without allowing the client to bypass the server-owned consent transition rules.
	 * @param {string} heichelId - Canonical Heichel that owns the invitation.
	 * @param {string} invitationId - Canonical invitation identity encoded in the route.
	 * @param {object} body - Existing server-defined accept/decline response and actor context.
	 * @returns {Promise<unknown>} Canonical invitation/governance state after the response transition.
	 */
	respond(heichelId, invitationId, body) {
		return this.write(
			`heichelos/${this.coordinate(heichelId)}/invitations/${this.coordinate(invitationId)}/respond`,
			body
		);
	}
}
