//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserFixtureCore
 * @description
 * The simulated API receives deterministic aliases, roles, nested series,
 * response envelopes, and persistence. The Awtsmoos contains all relations at once;
 * Awtsmoos.com exposes small helpers so every browser result remains explainable.
 */

const ROLE_CAPABILITIES = Object.freeze({
	owner: ['publishCanonical', 'publishReference', 'manageSettings', 'manageMembers', 'reviewSubmissions'],
	admin: ['publishCanonical', 'publishReference', 'manageSettings', 'manageMembers', 'reviewSubmissions'],
	moderator: ['reviewSubmissions', 'moderateDiscussion'],
	editor: ['publishCanonical', 'publishReference', 'editAnyContent'],
	contributor: ['submitContent', 'submitReference', 'editOwnContent'],
	member: ['submitContent', 'submitReference'],
	follower: ['follow'],
	guest: []
});

export function createFixtureCore(initialFactory) {
	const key = 'BH.unifiedSocial.browserFixture.v1';
	if (location.search.includes('fixtureReset=1')) {
		for (const name of Object.keys(localStorage)) {
			if (name === key || name.startsWith('awtsmoos.socialComposer.')) {
				localStorage.removeItem(name);
			}
		}
	}
	const core = {
		key,
		state: JSON.parse(localStorage.getItem(key) || 'null') || initialFactory()
	};
	core.save = () => localStorage.setItem(key, JSON.stringify(core.state));
	core.json = (success, status = 200) => Promise.resolve(new Response(
		JSON.stringify(status < 400 ? { success } : { error: success }),
		{ status, headers: { 'content-type': 'application/json' } }
	));
	core.slug = value => String(value || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	core.alias = id => ({
		aliasId: id,
		id,
		name: id === 'teacher' ? 'Teacher of Light' : id,
		description: 'Fixture alias.'
	});
	core.role = (heichel, aliasId = 'teacher') => {
		if (heichel.ownerAlias === aliasId) return 'owner';
		return heichel.members?.[aliasId] || 'guest';
	};
	core.access = (heichel, aliasId = 'teacher') => {
		const role = core.role(heichel, aliasId);
		const direct = ['owner', 'admin', 'editor'].includes(role);
		return {
			role,
			roles: [role],
			sources: [{ source: role === 'owner' ? 'heichel.info' : 'heichel.members', role }],
			capabilities: ROLE_CAPABILITIES[role] || [],
			actions: {
				content: {
					mode: direct ? 'direct' : 'submit',
					explanation: direct
						? `${role} may publish content directly.`
						: `${role} may submit content; moderator approval is required.`
				},
				reference: {
					mode: direct ? 'direct' : 'submit',
					explanation: direct
						? `${role} may publish reference placement directly.`
						: `${role} may submit reference placement; moderator approval is required.`
				}
			}
		};
	};
	core.node = function node(heichel, id, path = []) {
		const item = heichel.series[id];
		const children = Object.values(heichel.series)
			.filter(child => child.parentSeriesId === id)
			.map(child => node(heichel, child.seriesId, [...path, { id, name: item.name }]));
		return {
			...item,
			id,
			isRoot: id === 'root',
			postCount: 0,
			subSeriesCount: children.length,
			breadcrumb: [...path, { id, name: item.name }],
			children
		};
	};
	core.detail = (heichelId, seriesId = 'root', aliasId = 'teacher') => {
		const heichel = core.state.heichelos[heichelId];
		const tree = core.node(heichel, 'root');
		const flatSeries = [];
		const walk = item => {
			flatSeries.push({ ...item, children: undefined });
			item.children.forEach(walk);
		};
		walk(tree);
		return {
			heichel: { ...heichel, series: undefined, members: undefined },
			series: flatSeries.find(item => item.seriesId === seriesId),
			tree,
			flatSeries,
			access: core.access(heichel, aliasId)
		};
	};
	return core;
}
