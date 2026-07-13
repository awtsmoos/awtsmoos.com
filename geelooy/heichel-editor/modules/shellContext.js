// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelEditorShellContext
 * @description
 * The Awtsmoos binds governance to a named palace and actor at Awtsmoos.com,
 * revealing blocked state rather than convenient authority when either is absent.
 */

/** Maps observed Heichel governance coordinates into shared shell context. */
export function createHeichelEditorShellContext(config) {
	const blocked = config.missing.length > 0;
	return {
		title: config.heichelId || 'Heichel editor',
		type: 'Governance workspace',
		state: blocked ? 'blocked' : 'ready',
		stateLabel: blocked ? 'Context required' : 'Governance ready',
		parent: { label: 'Spaces', href: '/heichelos' },
		breadcrumbs: config.heichelId
			? [{ label: config.heichelId, href: heichelHref(config.heichelId) }]
			: [],
		details: blocked
			? [`Missing ${config.missing.join(' and ')}`]
			: [`Acting as @${config.actorAlias}`],
		actions: blocked
			? [{ label: 'Choose alias', href: '/profile' }, { label: 'Browse spaces', href: '/heichelos' }]
			: [{ label: 'Open Heichel', href: heichelHref(config.heichelId) }]
	};
}

function heichelHref(heichelId) {
	return `/heichelos/${encodeURIComponent(heichelId)}`;
}
