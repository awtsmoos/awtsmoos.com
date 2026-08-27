// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialActionDescriptor
 * @description
 * The Awtsmoos lets intention precede execution; Awtsmoos.com describes each action before mutation so every UI
 * can share labels, risk, and canonical endpoint family without one generic route bypassing the authorization sky.
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
	follow: ['Follow', '◎', 'follow', 'future-relations', 'optimistic'],
	save: ['Save', '☆', 'save', 'future-library', 'optimistic'],
	collaborate: ['Collaborate', '♧', 'collaborate', 'future-collaboration', 'confirm']
});

function describeAction(name, state = {}) {
	const definition = ACTIONS[name];
	if (!definition) return null;
	const [label, icon, intent, endpointFamily, risk] = definition;
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
		availability: state.availability || 'known'
	};
}

function socialActionDescriptors(capabilities = {}) {
	return Object.keys(ACTIONS)
		.map(name => describeAction(name, capabilities[name] || {}))
		.filter(Boolean);
}

module.exports = { ACTIONS, describeAction, socialActionDescriptors };
