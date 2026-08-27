//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ActionRegistry
 * @description The Awtsmoos gathers many commands into one language; Awtsmoos.com lets bars, sheets, and contextual docks share labels, icons, emoji, and existing action IDs without duplicating mutation law.
 */
import { PRESENTATION_THEMES } from '../../model/PresentationThemes.js';

export const MOBILE_BAR_ACTIONS = Object.freeze([
	item('Slides', 'slides', { emoji: '📚', action: 'toggle-left' }),
	item('Insert', 'sparkles', { emoji: '✨', sheet: 'insert' }),
	item('Design', 'palette', { emoji: '🎨', sheet: 'design' }),
	item('More', 'more', { emoji: '⚡', sheet: 'more' })
]);

export const ELEMENT_DOCK_ACTIONS = Object.freeze([
	item('Style', 'palette', { emoji: '🎨', sheet: 'design' }),
	item('Copy', 'copy', { emoji: '⧉', action: 'copy-element' }),
	item('Duplicate', 'duplicate', { emoji: '✨', action: 'duplicate-element' }),
	item('Arrange', 'arrange', { emoji: '⇅', sheet: 'arrange' }),
	item('Delete', 'trash', { emoji: '🗑', action: 'delete-element', danger: true })
]);

const INSERT_SECTIONS = Object.freeze([
	section('Content', [
		item('Heading', 'heading', { emoji: '🔠', insert: 'heading' }),
		item('Text', 'text', { emoji: '✍️', insert: 'text' }),
		item('Rectangle', 'rectangle', { emoji: '▭', insert: 'rect' }),
		item('Circle', 'circle', { emoji: '◯', insert: 'circle' }),
		item('Image', 'image', { emoji: '🖼', action: 'pick-image' })
	]),
	section('Slide', [
		item('New slide', 'plus', { emoji: '➕', action: 'add-slide' }),
		item('Duplicate slide', 'duplicate', { emoji: '📑', action: 'duplicate-slide' })
	])
]);

const ARRANGE_SECTIONS = Object.freeze([
	section('Layers', [
		item('Bring front', 'front', { action: 'layer-front', requiresSelection: true }),
		item('Forward', 'forward', { action: 'layer-forward', requiresSelection: true }),
		item('Backward', 'backward', { action: 'layer-backward', requiresSelection: true }),
		item('Send back', 'back', { action: 'layer-back', requiresSelection: true })
	]),
	section('Element', [
		item('Copy', 'copy', { action: 'copy-element', requiresSelection: true }),
		item('Duplicate', 'duplicate', { action: 'duplicate-element', requiresSelection: true }),
		item('Delete', 'trash', { action: 'delete-element', danger: true, requiresSelection: true })
	])
]);

const MORE_SECTIONS = Object.freeze([
	section('Deck', [
		item('Speaker notes', 'notes', { emoji: '📝', action: 'toggle-notes' }),
		item('Share', 'share', { emoji: '👥', action: 'share' }),
		item('Present', 'present', { emoji: '▶️', action: 'present' })
	]),
	section('History', [
		item('Undo', 'undo', { action: 'undo' }),
		item('Redo', 'redo', { action: 'redo' })
	]),
	section('Files', [
		item('Import', 'import', { emoji: '📥', action: 'import' }),
		item('Awtslides', 'download', { emoji: '💾', action: 'download-json' }),
		item('HTML', 'html', { emoji: '🌐', action: 'download-html' })
	])
]);

/** Returns the current sheet model from trusted application metadata. */
export function getSheetDefinition(mode) {
	if (mode === 'insert') return { title: 'Insert', emoji: '✨', sections: INSERT_SECTIONS };
	if (mode === 'arrange') return { title: 'Arrange', emoji: '⇅', sections: ARRANGE_SECTIONS };
	if (mode === 'more') return { title: 'More', emoji: '⚡', sections: MORE_SECTIONS };
	return {
		title: 'Design',
		emoji: '🎨',
		sections: [
			section('Themes', PRESENTATION_THEMES.map(theme => ({ label: theme.label, icon: 'palette', theme }))),
			section('Advanced', [item('Full inspector', 'arrange', { emoji: '🎛', action: 'toggle-right' })])
		]
	};
}

function item(label, icon, options = {}) {
	return Object.freeze({ label, icon, ...options });
}

function section(label, items) {
	return Object.freeze({ label, items: Object.freeze(items) });
}
