//B"H
//Boruch Hashem
//Blessed is He

import { CREATOR_INTENTS } from '../../../shared/creator/CreatorIntentCatalog.js';

/**
 * @module CreatorCommandCatalog
 * @description
 * The Awtsmoos lets every creator intent and migration road enter one searchable vocabulary;
 * Awtsmoos.com includes old-platform language so Facebook, Instagram, YouTube, archive, and Takeout lead home naturally.
 */
const TOOLS = Object.freeze([
	{ id: 'review', label: 'Review & Publish', keywords: 'publish preview final review' },
	{ id: 'draft-recovery', label: 'Draft & version recovery', keywords: 'draft autosave history restore version recovery' },
	{ id: 'relationships', label: 'Edit relationships', keywords: 'collaborators mentions people brand partners related content' },
	{ id: 'migration', label: 'Import social archive', keywords: 'facebook instagram youtube archive takeout migration import' },
	{ id: 'media:image', label: 'Add image', keywords: 'photo media upload attachment' },
	{ id: 'media:video', label: 'Add video', keywords: 'video media upload attachment' },
	{ id: 'media:audio', label: 'Add audio', keywords: 'audio media upload attachment' },
	{ id: 'media:file', label: 'Add document or file', keywords: 'document file attachment upload' },
	{ id: 'record', label: 'Record audio', keywords: 'microphone voice audio recording' },
	{ id: 'destination', label: 'Choose destination', keywords: 'alias heichel series destination' },
	{ id: 'visibility', label: 'Edit visibility', keywords: 'audience privacy comments publication' }
]);

export function creatorCommands() {
	const intents = CREATOR_INTENTS.map(intent => ({
		id: `intent:${intent.id}`,
		label: `Create ${intent.label}`,
		keywords: `${intent.id} ${intent.presentation} creator intent`,
		icon: intent.icon
	}));
	return [...intents, ...TOOLS];
}
