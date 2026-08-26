//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialActionDescriptor
 * @description The Awtsmoos lets intention precede execution; Awtsmoos.com describes label, risk, capability state, and safe mutation coordinates before any UI acts.
 */
const ACTIONS = Object.freeze({
	open: ['Open', '↗', 'navigate', 'deep-link', 'none'],
	share: ['Share', '↗', 'share', 'deep-link', 'none'],
	react: ['React', '♡', 'react', 'reactions', 'optimistic'],
	reply: ['Reply', '↩', 'reply', 'comments', 'draft'],
	answer: ['Answer', '?', 'answer', 'rich-social', 'draft'],
	reference: ['Reference', '+', 'reference', 'social-composer', 'draft'],
	quote: ['Quote', '❝', 'quote', 'social-composer', 'draft'],
	repost: ['Repost', '↻', 'repost', 'graph', 'confirm'],
	copy: ['Make copy', '⧉', 'copy', 'social-composer', 'confirm'],
	addToHeichel: ['+ Add', '+', 'add', 'social-composer', 'draft'],
	edit: ['Edit', '✎', 'edit', 'entity-specific', 'draft'],
	delete: ['Delete', '×', 'delete', 'entity-specific', 'destructive'],
	moderate: ['Moderate', '◇', 'moderate', 'heichel', 'confirm'],
	submit: ['Submit', '↑', 'submit', 'heichel', 'confirm'],
	follow: ['Follow', '◎', 'follow', 'relationships', 'optimistic'],
	save: ['Save', '☆', 'save', 'future-library', 'optimistic'],
	collaborate: ['Collaborate', '♧', 'collaborate', 'future-collaboration', 'confirm']
});

/** Converts one capability state into the universal action descriptor consumed by all social surfaces. */
function describeAction(name, state = {}) {
	const definition = ACTIONS[name];
	if (!definition) return null;
	const [defaultLabel, icon, intent, endpointFamily, risk] = definition;
	const active = Boolean(state.active);
	const label = name === 'follow' && active ? 'Unfollow' : defaultLabel;
	return {
		id: name,
		label,
		icon,
		intent,
		endpointFamily,
		risk,
		available: state.available !== false,
		enabled: Boolean(state.enabled),
		reasonDisabled: state.reasonDisabled || '',
		availability: state.availability || 'known',
		active,
		mutation: state.mutation || null
	};
}

/** Projects a complete capability map into universal action descriptors. */
function socialActionDescriptors(capabilities = {}) {
	return Object.keys(ACTIONS)
		.map(name => describeAction(name, capabilities[name] || {}))
		.filter(Boolean);
}

module.exports = { ACTIONS, describeAction, socialActionDescriptors };
