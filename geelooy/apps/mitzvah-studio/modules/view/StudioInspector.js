// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioInspector.js
 * @description Renders selected-object properties while formatting, safe markup, mutation policy, and canonical state remain distinct authorities.
 * The Awtsmoos recreates property, editor, and edited vessel each instant while remaining their single Source;
 * Awtsmoos.com lets Tiferes reveal form and Gevurah receive edits without turning the Inspector into another store or force.
 */

import { studioPrimitiveMetrics } from '../catalog/MitzvahStudioCatalog.js';
import { studioInspectorMetricsText, studioRadiansToDegrees } from './StudioInspectorFormatting.js';
import { inspectorNumberField, inspectorSizeSummary, inspectorTextField, inspectorVectorFields } from './StudioInspectorMarkup.js';
import { escapeStudioHtml } from './StudioMarkupEscaping.js';
import { applyInspectorMutation } from './StudioInspectorMutation.js';

export class StudioInspector {
	/**
	 * @description Creates an Inspector bound to one host and canonical state, delegating all field changes to mutation policy.
	 * @param {HTMLElement} host Inspector host panel.
	 * @param {StudioDocumentState} state Canonical Studio state.
	 */
	constructor(host, state) {
		this.host = host;
		this.state = state;
		this.host.addEventListener('change', event => {
			applyInspectorMutation(this.state, event.target.closest('[data-field]'));
		});
	}

	/**
	 * @description Resolves the selected object from an immutable snapshot and renders either object fields or the empty state.
	 * @param {object} snapshot Immutable Studio view snapshot.
	 * @returns {void} Mutates only Inspector DOM.
	 */
	render(snapshot) {
		const object = snapshot.document.objects.find(item => item.id === snapshot.selectedId);
		if (!object) {
			this.renderEmpty();
			return;
		}
		this.renderObject(object);
	}

	/**
	 * @description Renders editable authored properties and derived geometry evidence for one selected object.
	 * @param {object} object Selected canonical object record.
	 * @returns {void} Replaces Inspector DOM and binds the selected object's delete command.
	 */
	renderObject(object) {
		const metrics = studioPrimitiveMetrics(object);
		this.host.innerHTML = `
			<header class="panel-heading"><div><strong>Inspector</strong><span>${escapeStudioHtml(object.id)}</span></div>
			<button class="danger subtle" data-delete type="button">Delete</button></header>
			<div class="inspector-summary"><span>${escapeStudioHtml(object.shape)}</span>
			<span>Base ${inspectorSizeSummary(object.size)}</span><span>${studioInspectorMetricsText(metrics)}</span></div>
			<div class="inspector-fields">
				${inspectorTextField('Label', 'label', object.label)}
				${inspectorTextField('Material role', 'materialRole', object.materialRole)}
				${inspectorNumberField('Seed', 'seed', object.seed, '1')}
				${inspectorVectorFields('Position', 'position', object.position, '0.25')}
				${inspectorVectorFields('Scale', 'scale', object.scale, '0.05', '0.05')}
				${inspectorNumberField('Yaw °', 'yawDegrees', studioRadiansToDegrees(object.rotation.y), '1')}
			</div>`;
		this.host.querySelector('[data-delete]').addEventListener('click', () => this.state.remove(object.id));
	}

	/**
	 * @description Renders the instructional Inspector state used when the document has no current selection.
	 * @returns {void} Replaces Inspector DOM with static guidance only.
	 */
	renderEmpty() {
		this.host.innerHTML = `<header class="panel-heading"><strong>Inspector</strong></header>
			<p class="empty-state">Select an object to edit position, scale, material, seed, and rotation.</p>`;
	}
}
