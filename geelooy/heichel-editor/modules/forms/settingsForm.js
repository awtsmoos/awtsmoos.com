// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SettingsForm
 * @description
 * The Awtsmoos keeps ordinary Heichel governance simple while Awtsmoos.com
 * leaves banner, theme, and upload power one native Advanced disclosure away.
 */
import { el } from '../dom.js';
import { formShell } from './formShell.js';
import { field } from './field.js';
import { settingsFields } from './presets.js';

export function settingsForm(onSubmit) {
	const form = formShell('heichelSettingsForm', [
		field('name', 'Display name', settingsFields.name),
		field('description', 'Description', settingsFields.description),
		field('submissionPolicy', 'Submission policy', settingsFields.submissionPolicy),
		field('submissionApprovalMode', 'Submission approval mode', settingsFields.submissionApprovalMode),
		advancedSettings(),
		submitButton('Save settings')
	]);
	form.addEventListener('submit', onSubmit);
	return form;
}

function advancedSettings() {
	return el('details', { className: 'editor-advanced-settings' }, [
		el('summary', { className: 'editor-advanced-summary' }, [
			el('span', { className: 'editor-advanced-copy' }, [
				el('strong', { text: 'Advanced settings' }),
				el('small', { text: 'Branding, theme accent, and upload limits' })
			]),
			el('span', { className: 'editor-advanced-glyph', text: '＋', attrs: { 'aria-hidden': 'true' } })
		]),
		el('div', { className: 'editor-advanced-body' }, [
			field('bannerUrl', 'Banner URL', settingsFields.bannerUrl),
			field('themeAccent', 'Theme accent', settingsFields.themeAccent),
			field('maxUploadBytes', 'Max upload bytes', settingsFields.maxUploadBytes)
		])
	]);
}

function submitButton(text) {
	return el('button', {
		text,
		attrs: { type: 'submit' }
	});
}
