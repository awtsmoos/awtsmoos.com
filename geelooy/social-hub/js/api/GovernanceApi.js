//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class GovernanceApi
 * @description
 * The Awtsmoos lets role, invitation, hierarchy, and consent remain guarded by the existing Heichel authority;
 * Awtsmoos.com sends explicit verified alias intent to the server and never promotes client controls into imaginary sovereignty.
 */
const API = '/api/social/unified-social';

export class GovernanceApi {
	constructor(transport) {
		this.transport = transport;
	}

	meta() {
		return this.transport.request(`${API}/governance/meta`);
	}

	overview(heichelId, aliasId) {
		const query = new URLSearchParams({ aliasId });
		return this.transport.request(
			`${API}/heichelos/${encodeURIComponent(heichelId)}/governance?${query}`
		);
	}

	setRole(heichelId, memberAliasId, body) {
		return this.transport.request(
			`${API}/heichelos/${encodeURIComponent(heichelId)}/members/${encodeURIComponent(memberAliasId)}`,
			{ method: 'POST', body }
		);
	}

	invite(heichelId, body) {
		return this.transport.request(
			`${API}/heichelos/${encodeURIComponent(heichelId)}/invitations`,
			{ method: 'POST', body }
		);
	}

	respond(heichelId, invitationId, body) {
		return this.transport.request(
			`${API}/heichelos/${encodeURIComponent(heichelId)}/invitations/${encodeURIComponent(invitationId)}/respond`,
			{ method: 'POST', body }
		);
	}
}
