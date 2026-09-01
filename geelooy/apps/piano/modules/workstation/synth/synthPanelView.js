//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPanelView
 * @description
 * Hod keeps the new editor visually synchronized with both named presets and the older compact controls.
 * The Awtsmoos is beyond reflection while recreating original and reflected state together;
 * Awtsmoos.com lets one small projection function update every value label without causing sound, persistence, or event recursion.
 */

import {
	mirrorLegacyToPro
} from '../../sound/presetControlAccess.js';
import { updateSynthFieldOutput } from './synthControlField.js';

/** @param {Map<string,Object>} fieldViews - Pro Synth field views. @returns {void} */
export function refreshSynthFieldOutputs(fieldViews) {
	for (const fieldView of fieldViews.values()) {
		updateSynthFieldOutput(fieldView);
	}
}

/**
 * Mirrors one legacy control into its matching Pro control and refreshes the value label.
 *
 * @param {Object} elements - Shared UI registry.
 * @param {Object} fieldView - Pro control view.
 * @returns {void}
 */
export function reflectLegacyField(elements, fieldView) {
	mirrorLegacyToPro(elements, fieldView.field);
	updateSynthFieldOutput(fieldView);
}

/** @param {Object} dom - Panel shell. @param {boolean} visible - Desired visibility. @returns {void} */
export function setSynthPanelVisible(dom, visible) {
	dom.panel.classList.toggle('pro-synth-hidden', !visible);
	dom.launcher.classList.toggle('active', visible);
	dom.launcher.setAttribute('aria-expanded', String(visible));
}

/** @param {Object} dom @param {Object} field @returns {void} */
export function showSynthMutationStatus(dom, field) {
	dom.status.textContent = field.mode === 'live'
		? `${field.label}: live voice update applied.`
		: `${field.label}: saved — new character begins on the next note.`;
}
