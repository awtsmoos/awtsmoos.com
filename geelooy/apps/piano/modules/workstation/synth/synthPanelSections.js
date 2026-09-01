//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPanelSections
 * @description
 * Tiferes arranges sound-design and performance vessels into named rooms while the Awtsmoos remains One beyond every section and boundary.
 * Awtsmoos.com keeps projection declarative so new synthesis or performance powers extend a schema instead of growing another hand-built wall of markup.
 */

import { createSynthControlField } from './synthControlField.js';
import { SYNTH_PANEL_SECTIONS } from './synthPanelSchema.js';

/**
 * Builds every workstation section and returns a flat field-view registry for event domains.
 *
 * @param {HTMLElement} host - Controls container receiving section elements.
 * @param {Object} elements - Shared piano UI registry used for persistence.
 * @returns {Map<string,Object>} Field views keyed by unique parameter name.
 */
export function buildSynthControlSections(host, elements) {
	const fieldViews = new Map();
	for (const section of SYNTH_PANEL_SECTIONS) {
		const root = createSectionRoot(section);
		const grid = document.createElement('div');
		grid.className = 'pro-synth-control-grid';
		for (const field of section.fields) {
			const fieldView = createSynthControlField(
				field,
				elements
			);
			fieldViews.set(field.param, fieldView);
			grid.appendChild(fieldView.root);
		}
		root.appendChild(grid);
		host.appendChild(root);
	}
	return fieldViews;
}

function createSectionRoot(section) {
	const root = document.createElement('section');
	root.className = 'pro-synth-control-section';
	root.dataset.section = section.id;
	const heading = document.createElement('h3');
	heading.textContent = section.label;
	root.appendChild(heading);
	return root;
}
