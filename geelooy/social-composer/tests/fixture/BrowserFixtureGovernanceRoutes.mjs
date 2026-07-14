//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserFixtureGovernanceRoutes
 * @description
 * Chrome receives deterministic member evidence, role mutation, invitations,
 * responses, and series-policy persistence. The Awtsmoos gives every relation its
 * reality while Awtsmoos.com proves the UI reloads server truth after each mutation.
 */

export function handleFixtureGovernance({ core, url, method, body }) {
	function memberEvidence(heichel, aliasId, role) {
		const access = core.access(
			role === 'owner' ? { ...heichel, ownerAlias: aliasId } : heichel,
			aliasId
		);
		return { aliasId, ...access, role };
	}
	function overview(heichelId, actorAliasId) {
		const heichel = core.state.heichelos[heichelId];
		const members = [
			memberEvidence(heichel, heichel.ownerAlias, 'owner'),
			...Object.entries(heichel.members || {}).map(([aliasId, role]) => {
				return memberEvidence(heichel, aliasId, role);
			})
		];
		return {
			access: core.access(heichel, actorAliasId),
			members,
			invitations: core.state.invitations.filter(item => item.heichelId === heichelId)
		};
	}
	const overviewRoute = url.pathname.match(/\/heichelos\/([^/]+)\/governance$/);
	if (overviewRoute && method === 'GET') {
		return core.json(overview(overviewRoute[1], url.searchParams.get('aliasId')));
	}
	const memberRoute = url.pathname.match(/\/heichelos\/([^/]+)\/members\/([^/]+)$/);
	if (memberRoute && method === 'POST') {
		const heichel = core.state.heichelos[memberRoute[1]];
		if (body.role === 'guest') delete heichel.members[memberRoute[2]];
		else heichel.members[memberRoute[2]] = body.role;
		core.save();
		return core.json({
			heichelId: memberRoute[1],
			memberAliasId: memberRoute[2],
			role: body.role
		});
	}
	const invitationRoute = url.pathname.match(/\/heichelos\/([^/]+)\/invitations$/);
	if (invitationRoute && method === 'POST') {
		const now = Date.now();
		const record = {
			id: `fixture-invite-${core.state.invitations.length + 1}`,
			heichelId: invitationRoute[1],
			invitedAliasId: body.memberAliasId,
			invitedByAliasId: body.aliasId,
			role: body.role,
			reason: body.reason,
			state: 'pending',
			createdAt: now,
			expiresAt: now + 604800000
		};
		core.state.invitations.push(record);
		core.save();
		return core.json(record);
	}
	const responseRoute = url.pathname.match(/\/heichelos\/([^/]+)\/invitations\/([^/]+)\/respond$/);
	if (responseRoute && method === 'POST') {
		const invitation = core.state.invitations.find(item => item.id === responseRoute[2]);
		invitation.state = body.response === 'accept' ? 'accepted' : 'rejected';
		if (invitation.state === 'accepted') {
			core.state.heichelos[responseRoute[1]].members[invitation.invitedAliasId] = invitation.role;
		}
		core.save();
		return core.json(invitation);
	}
	const policyRoute = url.pathname.match(/\/heichelos\/([^/]+)\/series\/([^/]+)\/policy$/);
	if (policyRoute && method === 'POST') {
		core.state.heichelos[policyRoute[1]].series[policyRoute[2]].policy = body.policy;
		core.save();
		return core.json(body.policy);
	}
	return null;
}
