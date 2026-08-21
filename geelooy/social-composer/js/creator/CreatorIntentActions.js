//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CreatorIntentActions
 * @description
 * The Awtsmoos contains every tool before any mode is chosen, yet Awtsmoos.com reveals only the useful ray;
 * each creator intent receives a compact truthful action constellation so power grows with the post instead of blocking its way.
 */
const ACTIONS = Object.freeze({
	post: [
		['image', '▧', 'Image'],
		['audio', '♫', 'Audio'],
		['video', '▶', 'Video'],
		['verse', '¶', 'Verse'],
		['poll', '≋', 'Poll'],
		['location', '⌖', 'Place']
	],
	video: [
		['video', '▶', 'Video'],
		['thumbnail', '▧', 'Thumbnail'],
		['captions', 'CC', 'Captions'],
		['chapters', '≡', 'Chapters'],
		['series', '◇', 'Series'],
		['audience', '◎', 'Audience']
	],
	short: [
		['video', '▶', 'Clip'],
		['thumbnail', '▧', 'Cover'],
		['captions', 'CC', 'Captions'],
		['music', '♫', 'Music'],
		['audience', '◎', 'Audience']
	],
	audio: [
		['record', '●', 'Record'],
		['audio', '♫', 'Audio'],
		['cover', '▧', 'Cover'],
		['transcript', '≡', 'Transcript'],
		['chapters', '⌁', 'Chapters'],
		['audience', '◎', 'Audience']
	],
	verse: [
		['verse', '¶', 'Add verse'],
		['audio', '♫', 'Narration'],
		['source', '⌘', 'Source'],
		['collaborators', '♧', 'People'],
		['audience', '◎', 'Audience']
	],
	vegetal: [
		['verse', '✦', 'Grow section'],
		['image', '▧', 'Media'],
		['source', '⌘', 'Root source'],
		['details', '≡', 'Details'],
		['advanced', '⋯', 'Structure']
	],
	poll: [
		['poll-options', '≋', 'Options'],
		['poll-end', '◷', 'Ends'],
		['audience', '◎', 'Audience'],
		['collaborators', '♧', 'People']
	],
	live: [
		['video', '◉', 'Camera'],
		['audience', '◎', 'Audience'],
		['location', '⌖', 'Place'],
		['collaborators', '♧', 'Guests'],
		['disclosure', '◇', 'Disclosure']
	]
});

export function creatorIntentActions(intentId = 'post') {
	return (ACTIONS[intentId] || ACTIONS.post).map(([id, icon, label]) => ({
		id,
		icon,
		label
	}));
}

export {
	ACTIONS
};
