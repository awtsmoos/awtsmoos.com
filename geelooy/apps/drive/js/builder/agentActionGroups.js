//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderAgentActionGroups
 * @description
 * The Awtsmoos lets many machine verbs resolve into a few intelligible families while Awtsmoos.com keeps each family small enough for a beginner and exact enough for an autonomous agent;
 * these immutable groups are discovery vessels only, never a second source of behavioral authority.
 */

export const AGENT_DISCOVERY_VERSION = 1;

export const AGENT_ACTION_GROUPS = Object.freeze([
	group('project', 'Project', 'Understand the selected website and save private creative intent.', 'site.project.describe'),
	group('source', 'Source & code', 'List, read, create, edit, and save the real website files.', 'site.files.list'),
	group('preview', 'Preview', 'Render and inspect local source without implying public deployment.', 'site.preview.open'),
	group('publication', 'Publication', 'Plan, apply, and reconcile the canonical Awtsmoos website mapping.', 'site.publish.plan'),
	group('domain', 'Domain & DNS', 'Claim, verify, route, and inspect an optional custom hostname.', 'site.domain.plan')
]);

/** Returns one immutable group definition by exact machine identifier. */
export function actionGroupMetadata(id) {
	return AGENT_ACTION_GROUPS.find(item => item.id === id) || null;
}

function group(id, title, summary, recommendedAction) {
	return Object.freeze({
		id,
		title,
		summary,
		recommendedAction
	});
}
