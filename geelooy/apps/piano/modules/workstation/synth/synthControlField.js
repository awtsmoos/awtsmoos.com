//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthControlField
 * @description
 * Yesod registers one sound or performance parameter while Hod now owns the finite DOM garments that display it.
 * The Awtsmoos is beyond slider, select, badge, and value while recreating each vessel anew;
 * Awtsmoos.com keeps registration and presentation distinct so a broad workstation remains readable, testable, and smaller than the boundaries it reveals.
 */

import { registerProControl } from '../../sound/presetControlAccess.js';
import {
	createControlElement,
	createControlHeading,
	formatControlValue
} from './synthControlElements.js';

/**
 * Builds and registers one Pro Synth field from its declarative schema.
 *
 * @param {Object} field - Sound or performance field descriptor.
 * @param {Object} elements - Shared piano UI registry used for settings persistence.
 * @returns {{root:HTMLElement,control:HTMLElement,output:HTMLOutputElement,field:Object}} Field view.
 */
export function createSynthControlField(field, elements) {
	const root = document.createElement('label');
	root.className = 'pro-synth-control-field';
	root.dataset.param = field.param;
	root.dataset.domain = field.domain || 'sound';
	const heading = createControlHeading(field);
	const control = createControlElement(field, elements);
	control.dataset.synthParam = field.param;
	control.dataset.synthMode = field.mode || 'next';
	registerProControl(elements, field.param, control);
	const output = document.createElement('output');
	output.className = 'pro-synth-control-value';
	const fieldView = {
		root,
		control,
		output,
		field
	};
	root.append(heading, control, output);
	updateSynthFieldOutput(fieldView);
	return fieldView;
}

/**
 * Refreshes the readable output for one field from its current form value.
 *
 * @param {Object} fieldView - Registered field view.
 * @returns {void}
 */
export function updateSynthFieldOutput(fieldView) {
	fieldView.output.textContent = formatControlValue(
		fieldView.control,
		fieldView.field
	);
}
