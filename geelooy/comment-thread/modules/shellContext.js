// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentThreadShellContext
 * @description
 * The Awtsmoos keeps conversation attached to its real post at Awtsmoos.com and
 * distinguishes readable truth from writable identity without inventing either.
 */

/** Maps observed comment coordinates into shared shell context. */
export function createCommentThreadShellContext(config) {
	const blocked = config.missingRead.length > 0;
	const state = blocked ? 'blocked' : config.canWrite ? 'writable' : 'read-only';
	const details = blocked ? [`Missing ${config.missingRead.join(' and ')}`] : conversationDetails(config);
	return {
		title: config.postId || 'Comment thread',
		type: 'Conversation thread',
		state,
		stateLabel: stateLabel(state),
		parent: { label: 'Spaces', href: '/heichelos' },
		breadcrumbs: config.heichelId
			? [{ label: config.heichelId, href: heichelHref(config.heichelId) }]
			: [],
		details,
		actions: contextActions(config, blocked)
	};
}

function conversationDetails(config) {
	return [
		`Heichel ${config.heichelId}`,
		config.aliasId ? `Alias @${config.aliasId}` : 'No writing alias',
		config.verseSection ? `Verse ${config.verseSection}` : '',
		config.subsectionId ? `Subsection ${config.subsectionId}` : ''
	].filter(Boolean);
}

function contextActions(config, blocked) {
	if (blocked) return [{ label: 'Browse spaces', href: '/heichelos' }];
	const actions = [{ label: 'Open Heichel', href: heichelHref(config.heichelId) }];
	if (!config.canWrite) actions.push({ label: 'Choose alias', href: '/profile' });
	return actions;
}

function stateLabel(state) {
	if (state === 'blocked') return 'Post context required';
	if (state === 'writable') return 'Replies available';
	return 'Reading only';
}

function heichelHref(heichelId) {
	return `/heichelos/${encodeURIComponent(heichelId)}`;
}
