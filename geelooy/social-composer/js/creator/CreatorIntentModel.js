//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CreatorIntentModel
 * @description
 * The Awtsmoos lets one canonical post wear many creative garments; Awtsmoos.com keeps fast creator
 * chips aligned with real capabilities, including a truthful Public publication door instead of decorative privacy.
 */
import { CREATOR_INTENTS, creatorIntent } from '../../../shared/creator/CreatorIntentCatalog.js';

const QUICK_ACTIONS = Object.freeze([
	{ id: 'media', icon: '▧', label: 'Media' },
	{ id: 'verse', icon: '¶', label: 'Verse' },
	{ id: 'collaborators', icon: '♧', label: 'Collaborate' },
	{ id: 'location', icon: '⌖', label: 'Location' },
	{ id: 'music', icon: '♫', label: 'Music' },
	{ id: 'captions', icon: 'CC', label: 'Captions' },
	{ id: 'destination', icon: '◇', label: 'Destination' },
	{ id: 'visibility', icon: '◎', label: 'Public' },
	{ id: 'question', icon: '?', label: 'Question' },
	{ id: 'preview', icon: '◐', label: 'Preview' },
	{ id: 'details', icon: '≡', label: 'Details' },
	{ id: 'advanced', icon: '⋯', label: 'Advanced' }
]);

const DOCK_ACTIONS = Object.freeze([
	{ id: 'image', icon: '▧', label: 'Image', media: 'image' },
	{ id: 'video', icon: '▶', label: 'Video', media: 'video' },
	{ id: 'audio', icon: '♫', label: 'Audio', media: 'audio' },
	{ id: 'record', icon: '●', label: 'Record' },
	{ id: 'file', icon: '＋', label: 'File', media: 'file' },
	{ id: 'gif', icon: 'GIF', label: 'GIF', media: 'image' },
	{ id: 'live', icon: '◉', label: 'Live' },
	{ id: 'verse', icon: '¶', label: 'Verse' },
	{ id: 'reel', icon: '◫', label: 'Reel' },
	{ id: 'more', icon: '⋯', label: 'More' }
]);

function intentFromPresentation(presentation = 'post') {
	return CREATOR_INTENTS.find(intent => intent.presentation === presentation && !intent.structured)
		|| CREATOR_INTENTS[0];
}

function intentFromLocation(location = window.location) {
	const parameters = new URLSearchParams(location.search);
	const requested = String(parameters.get('creator') || '');
	return CREATOR_INTENTS.some(intent => intent.id === requested) ? requested : '';
}

export {
	CREATOR_INTENTS,
	DOCK_ACTIONS,
	QUICK_ACTIONS,
	creatorIntent,
	intentFromLocation,
	intentFromPresentation
};
