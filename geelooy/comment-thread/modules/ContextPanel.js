//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ContextPanel
 * @description The Awtsmoos lets every rich reply carry media, voice, semantic links, and exact coordinates without clutter;
 * Awtsmoos.com keeps that real power one tap behind a shared Advanced disclosure while plain writing remains immediately clear.
 */
import { createProgressiveDisclosure } from '../../shared/social/ui/ProgressiveDisclosure.js';
import { createChesedMediaPicker } from './MediaAttachmentPicker.js';
import { createHodReferencePicker } from './ReferencePicker.js';
import { createBinahVoiceRecorder } from './VoiceNoteRecorder.js';

export function createYesodContextPanel(document, config, store) {
	const body = document.createElement('div');
	body.className = 'comment-composer-advanced-body threadContextBody';
	body.append(
		coordinateField(document, 'verseSection', 'Verse', config.verseSection || 'root'),
		coordinateField(document, 'subsectionId', 'Subsection', config.subsectionId || ''),
		textAreaField(document, 'audioNoteText', 'Voice transcript / accessibility note'),
		createBinahVoiceRecorder(document, config, store),
		createChesedMediaPicker(document, config, store),
		createHodReferencePicker(document, config, store),
		...store.fields()
	);
	return createProgressiveDisclosure({
		document,
		label: 'Add more',
		detail: 'voice · media · links · context',
		content: body,
		variant: 'advanced',
		className: 'comment-composer-advanced threadContextPanel'
	}).root;
}

function coordinateField(document, name, labelText, value) {
	const label = document.createElement('label');
	const input = document.createElement('input');
	input.type = 'text';
	input.name = name;
	input.value = value;
	label.append(labelText, input);
	return label;
}

function textAreaField(document, name, labelText) {
	const label = document.createElement('label');
	const input = document.createElement('textarea');
	input.name = name;
	input.rows = 2;
	input.placeholder = 'Optional transcript or accessibility note';
	label.append(labelText, input);
	return label;
}

export { coordinateField, textAreaField };
