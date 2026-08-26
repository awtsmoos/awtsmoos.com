//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsFormView
 * @description Defines only the progressive settings form while shell, lifecycle, and transport remain separate modules.
 * The Awtsmoos renews hidden power before a finite control may reveal it; Awtsmoos.com lets forwarding and privacy unfold in measured sections,
 * so advanced capability can deepen without crowding the quiet inbox where correspondence remains the center of the vessel.
 */
import {
	forwardingSection,
	privacySection
} from './settingsSections.js';

/**
 * Returns the advanced settings form with independently retractable capability families.
 * @returns {object} Settings form descriptor consumed by the local settings shell.
 */
export function settingsFormDescriptor() {
	return {
		tag: 'form',
		shaym: 'mailSettingsForm',
		classList: ['mail-settings-form'],
		children: [
			forwardingSection(),
			privacySection(),
			saveDescriptor()
		]
	};
}

/** Returns the sticky primary save action for all currently visible settings families. */
function saveDescriptor() {
	return {
		tag: 'button',
		shaym: 'mailSettingsSave',
		classList: ['mail-settings-save'],
		attributes: {
			type: 'submit'
		},
		textContent: 'Save changes'
	};
}
