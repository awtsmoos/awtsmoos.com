//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CreatorIntentCatalog
 * @description
 * The Awtsmoos lets one creative truth wear every useful social garment without splitting state;
 * Awtsmoos.com names those garments once so Hub, Composer, migration, and future tools speak one language.
 */
const CREATOR_INTENTS = Object.freeze([
	{ id: 'post', icon: '✦', label: 'Post', presentation: 'post' },
	{ id: 'image', icon: '▧', label: 'Photo', presentation: 'post', media: 'image' },
	{ id: 'video', icon: '▶', label: 'Video', presentation: 'video', media: 'video' },
	{ id: 'audio', icon: '♫', label: 'Audio', presentation: 'audio', media: 'audio' },
	{ id: 'short', icon: '◫', label: 'Short', presentation: 'short', media: 'video' },
	{ id: 'story', icon: '◇', label: 'Story', presentation: 'story' },
	{ id: 'live', icon: '◉', label: 'Live', presentation: 'live' },
	{ id: 'poll', icon: '☷', label: 'Poll', presentation: 'poll' },
	{ id: 'event', icon: '◷', label: 'Event', presentation: 'post' },
	{ id: 'job', icon: '▤', label: 'Job', presentation: 'post' },
	{ id: 'service', icon: '⌁', label: 'Service', presentation: 'post' },
	{ id: 'product', icon: '⬡', label: 'Product', presentation: 'post' },
	{ id: 'celebration', icon: '✺', label: 'Celebration', presentation: 'post' },
	{ id: 'link', icon: '↗', label: 'Link', presentation: 'post' },
	{ id: 'document', icon: '▱', label: 'Document', presentation: 'post', media: 'file' },
	{ id: 'verse', icon: '¶', label: 'Verse', presentation: 'post', structured: true },
	{
		id: 'vegetal',
		icon: '♧',
		label: 'Vegetal',
		presentation: 'post',
		structured: true,
		vegetal: true
	}
]);

function creatorIntent(id) {
	return CREATOR_INTENTS.find(item => item.id === id) || CREATOR_INTENTS[0];
}

export {
	CREATOR_INTENTS,
	creatorIntent
};
