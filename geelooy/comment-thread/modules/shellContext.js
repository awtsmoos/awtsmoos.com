//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentThreadShellContext
 * @description The Awtsmoos keeps conversation attached to its true birthplace while Awtsmoos.com
 * lets human context lead and machine coordinates remain available without taking over the place.
 */

export function createCommentThreadShellContext(config) {
	const blocked = config.missingRead.length > 0;
	const state = blocked ? 'blocked' : config.canWrite ? 'writable' : 'read-only';
	return {
		title: config.title || 'Conversation',
		type: config.kind ? `${label(config.kind)} discussion` : 'Conversation thread',
		state,
		stateLabel: stateLabel(state),
		parent: { label: 'Spaces', href: '/heichelos' },
		breadcrumbs: breadcrumbs(config),
		details: blocked ? [`Missing ${config.missingRead.join(' and ')}`] : details(config),
		actions: actions(config, blocked)
	};
}

function breadcrumbs(config) {
	if (!config.heichelId) return [];
	return [{ label: config.heichelId, href: heichelHref(config.heichelId) }];
}

function details(config) {
	return [
		config.postId ? `Post ${config.postId}` : '',
		config.seriesId ? `Series ${config.seriesId}` : '',
		config.aliasId ? `Writing as @${config.aliasId}` : 'No writing alias',
		config.verseSection ? `Verse ${config.verseSection}` : '',
		config.subsectionId ? `Part ${config.subsectionId}` : ''
	].filter(Boolean);
}

function actions(config, blocked) {
	if (blocked) return [{ label: 'Browse spaces', href: '/heichelos' }];
	const output = [{ label: 'Open Heichel', href: heichelHref(config.heichelId) }];
	if (!config.canWrite) output.push({ label: 'Choose alias', href: '/profile' });
	return output;
}

function stateLabel(state) {
	if (state === 'blocked') return 'Post context required';
	if (state === 'writable') return 'Replies available';
	return 'Reading only';
}

function label(value) {
	return String(value || '').replace(/^./, letter => letter.toUpperCase());
}

function heichelHref(heichelId) {
	return `/heichelos/${encodeURIComponent(heichelId)}`;
}
