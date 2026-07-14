//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class GovernanceApi
 * @description
 * Member evidence, hierarchy-safe role mutation, consent-bearing invitations, and
 * series policy use one verified institutional gateway. The Awtsmoos gives every
 * relation its life while Awtsmoos.com refreshes server truth after every mutation.
 */

const API = '/api/social';

export class GovernanceApi {
	constructor(transport) {
		this.transport = transport;
	}

	overview(heichelId, aliasId) {
		return this.transport.request(
			`${API}/unified-social/heichelos/${encodeURIComponent(heichelId)}/governance?aliasId=${encodeURIComponent(aliasId)}`
		);
	}

	setMemberRole({ heichelId, actorAliasId, memberAliasId, role, reason }) {
		const path = [
			API,
			'unified-social/heichelos',
			encodeURIComponent(heichelId),
			'members',
			encodeURIComponent(memberAliasId)
		].join('/');
		return this.transport.request(path, {
			method: 'POST',
			body: {
				aliasId: actorAliasId,
				role,
				reason
			}
		});
	}

	invite({ heichelId, actorAliasId, memberAliasId, role, reason }) {
		return this.transport.request(
			`${API}/unified-social/heichelos/${encodeURIComponent(heichelId)}/invitations`,
			{
				method: 'POST',
				body: {
					aliasId: actorAliasId,
					memberAliasId,
					role,
					reason
				}
			}
		);
	}

	respond({ heichelId, actorAliasId, invitationId, response }) {
		const path = [
			API,
			'unified-social/heichelos',
			encodeURIComponent(heichelId),
			'invitations',
			encodeURIComponent(invitationId),
			'respond'
		].join('/');
		return this.transport.request(path, {
			method: 'POST',
			body: { aliasId: actorAliasId, response }
		});
	}

	updateSeriesPolicy({ heichelId, seriesId, actorAliasId, policy }) {
		const path = [
			API,
			'unified-social/heichelos',
			encodeURIComponent(heichelId),
			'series',
			encodeURIComponent(seriesId),
			'policy'
		].join('/');
		return this.transport.request(path, {
			method: 'POST',
			body: { aliasId: actorAliasId, policy }
		});
	}
}
