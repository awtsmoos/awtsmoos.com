//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsView
 * @description Owns only the retractable settings shell while the modular form owns forwarding and privacy controls.
 * The Awtsmoos hides depth until the vessel asks for it; Awtsmoos.com keeps one drawer shell and one form authority so advanced Mail power cannot fork into contradictory interfaces.
 */
import { settingsFormDescriptor } from './settingsFormView.js';

/** Returns the complete local settings drawer descriptor consumed by the Mail UI renderer. */
export function settingsDrawerDescriptor() {
	return {
		tag: 'div',
		classList: ['mail-settings-layer'],
		shaym: 'mailSettingsLayer',
		attributes: { 'data-state': 'closed', 'aria-hidden': 'true' },
		children: [backdropDescriptor(), drawerDescriptor()]
	};
}

/** Returns the dismissible local backdrop descriptor. */
function backdropDescriptor() {
	return {
		tag: 'button',
		shaym: 'mailSettingsBackdrop',
		classList: ['mail-settings-backdrop'],
		attributes: { type: 'button', tabindex: '-1', 'aria-label': 'Close Mail settings' }
	};
}

/** Returns the accessible side-sheet shell around the single modular settings form. */
function drawerDescriptor() {
	return {
		tag: 'aside',
		shaym: 'mailSettingsDrawer',
		classList: ['mail-settings-drawer'],
		attributes: {
			role: 'dialog',
			'aria-modal': 'true',
			'aria-labelledby': 'mail-settings-title'
		},
		children: [settingsHeader(), settingsFormDescriptor(), settingsStatus()]
	};
}

/** Returns drawer heading, explanation, and close action. */
function settingsHeader() {
	return {
		tag: 'header',
		classList: ['mail-settings-header'],
		children: [
			{
				tag: 'div',
				children: [
					{ tag: 'span', classList: ['mail-settings-kicker'], textContent: 'Mail controls' },
					{ tag: 'h2', attributes: { id: 'mail-settings-title' }, textContent: 'Advanced settings' },
					{ tag: 'p', textContent: 'Forward one alias, every alias you own, or both.' }
				]
			},
			{
				tag: 'button',
				shaym: 'mailSettingsClose',
				classList: ['mail-settings-close'],
				attributes: { type: 'button', 'aria-label': 'Close settings' },
				textContent: '×'
			}
		]
	};
}

/** Mirrors the native checkbox state onto its visual switch wrapper. */
export function syncSwitchState(input) {
	if (!input) return;
	const on = input.checked === true;
	input.closest?.('.mail-settings-toggle')?.classList.toggle('is-on', on);
	input.setAttribute('aria-checked', String(on));
}

/** Returns the aria-live settings status vessel. */
function settingsStatus() {
	return {
		tag: 'p',
		shaym: 'mailSettingsStatus',
		classList: ['mail-settings-status'],
		attributes: { role: 'status', 'aria-live': 'polite' },
		textContent: 'Settings load when this panel opens.'
	};
}
