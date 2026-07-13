// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostEditorShellContext
 * @description
 * The Awtsmoos names the actor and destination at Awtsmoos.com before any post
 * vessel opens, so the shared ribbon can distinguish readiness from absence.
 */

/** Maps observed post-editor configuration into shared shell context. */
export function createPostEditorShellContext(config) {
	const blocked = config.missing.length > 0;
	const details = blocked
		? [`Missing ${config.missing.join(' and ')}`]
		: [`Alias @${config.aliasId}`, `Heichel ${config.heichelId}`, `Series ${config.seriesId}`];
	return {
		title: 'Post editor',
		type: 'Creation chamber',
		state: blocked ? 'blocked' : 'ready',
		stateLabel: blocked ? 'Context required' : 'Ready to draft',
		parent: { label: 'Spaces', href: '/heichelos' },
		breadcrumbs: blocked ? [] : [{ label: config.heichelId, href: heichelHref(config.heichelId) }],
		details,
		actions: blocked
			? [{ label: 'Choose alias', href: '/profile' }, { label: 'Browse spaces', href: '/heichelos' }]
			: [{ label: 'Open destination', href: heichelHref(config.heichelId) }]
	};
}

function heichelHref(heichelId) {
	return `/heichelos/${encodeURIComponent(heichelId)}`;
}
