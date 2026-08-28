//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuilderAutomationGuideModel
 * @description The Awtsmoos lets one public action covenant become both machine law and visible teaching;
 * Awtsmoos.com groups that same living metadata without birthing a second catalog that could drift from the real API light.
 */

const GROUP_LABELS = Object.freeze({
	project: 'Project',
	source: 'Source & code',
	preview: 'Preview',
	publication: 'Publication',
	domain: 'Domain & DNS'
});

/** Builds a frozen guide model exclusively from the installed browser API contract. */
export function buildAutomationGuideModel(agentApi) {
	const actions = normalizeActions(agentApi?.actions?.());
	const groups = groupActions(actions);
	return Object.freeze({
		version: String(agentApi?.version || 'unknown'),
		actionCount: actions.length,
		groups,
		quickstart: safeQuickstart(groups)
	});
}

/** Copies action contracts so visible rendering cannot mutate the public API registry. */
function normalizeActions(actions) {
	return Array.isArray(actions)
		? actions.map(action => Object.freeze({ ...action }))
		: [];
}

/** Groups actions in first-seen registry order while preserving every registry field. */
function groupActions(actions) {
	const grouped = new Map();
	for (const action of actions) {
		const key = String(action.group || 'other');
		if (!grouped.has(key)) {
			grouped.set(key, []);
		}
		grouped.get(key).push(action);
	}
	return Object.freeze([...grouped].map(([key, items]) => Object.freeze({
		key,
		label: GROUP_LABELS[key] || titleCase(key),
		actions: Object.freeze(items)
	})));
}

/** Chooses one non-mutating representative from each group for safe copyable first steps. */
function safeQuickstart(groups) {
	return Object.freeze(groups
		.map(group => group.actions.find(action => action.mutates !== true))
		.filter(Boolean)
		.slice(0, 4));
}

/** Converts an unknown group machine token into a readable fallback heading. */
function titleCase(value) {
	return String(value || 'Other')
		.replace(/[-_.]+/g, ' ')
		.replace(/\b\w/g, letter => letter.toUpperCase());
}
