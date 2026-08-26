// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioInspector.js
 * @description Edits one selected object through explicit accessible fields and sanitized document mutations.
 * The Awtsmoos renews every measure while the inspector reveals only the finite levers an author may turn;
 * Awtsmoos.com keeps property editing readable so state changes are easy to trace, undo, and learn.
 */

import { studioPrimitiveMetrics } from '../catalog/MitzvahStudioCatalog.js';

export class StudioInspector {
	constructor(host, state) {
		this.host = host;
		this.state = state;
		this.host.addEventListener('change', event => this.change(event));
	}

	render(snapshot) {
		const object = snapshot.document.objects.find(item => item.id === snapshot.selectedId);
		if (!object) {
			this.host.innerHTML = '<header class="panel-heading"><strong>Inspector</strong></header><p class="empty-state">Select an object to edit it.</p>';
			return;
		}
		const metrics = studioPrimitiveMetrics(object);
		this.host.innerHTML = `
			<header class="panel-heading">
				<div><strong>Inspector</strong><span>${escapeHtml(object.id)}</span></div>
				<button class="danger subtle" data-delete type="button">Delete</button>
			</header>
			<div class="inspector-fields">
				${textField('Label', 'label', object.label)}
				${textField('Material role', 'materialRole', object.materialRole)}
				${numberField('Seed', 'seed', object.seed, '1')}
				<fieldset><legend>Position</legend>${vectorFields('position', object.position, '0.25')}</fieldset>
				<fieldset><legend>Scale</legend>${vectorFields('scale', object.scale, '0.05', '0.05')}</fieldset>
				${numberField('Yaw °', 'yawDegrees', radiansToDegrees(object.rotation.y), '1')}
			</div>
			<p class="inspector-metrics">${metrics ? `${metrics.vertices} vertices · ${metrics.triangles} triangles` : 'Authored / custom geometry'}</p>
		`;
		this.host.querySelector('[data-delete]').addEventListener('click', () => this.state.remove(object.id));
	}

	change(event) {
		const input = event.target.closest('[data-field]');
		const object = this.state.find();
		if (!input || !object) return;
		const field = input.dataset.field;
		const axis = input.dataset.axis;
		if (axis) {
			this.state.update(object.id, {
				[field]: { ...object[field], [axis]: numeric(input.value) }
			});
			return;
		}
		if (field === 'yawDegrees') {
			this.state.update(object.id, {
				rotation: { ...object.rotation, y: numeric(input.value) * Math.PI / 180 }
			});
			return;
		}
		this.state.update(object.id, {
			[field]: input.type === 'number' ? numeric(input.value) : input.value
		});
	}
}

function vectorFields(field, vector, step, minimum = '') {
	return ['x', 'y', 'z'].map(axis => `
		<label>${axis.toUpperCase()}<input data-field="${field}" data-axis="${axis}" type="number" step="${step}" min="${minimum}" value="${numeric(vector[axis])}"></label>
	`).join('');
}

function numberField(label, field, value, step) {
	return `<label>${label}<input data-field="${field}" type="number" step="${step}" value="${numeric(value)}"></label>`;
}

function textField(label, field, value) {
	return `<label>${label}<input data-field="${field}" type="text" value="${escapeAttribute(value)}"></label>`;
}

function radiansToDegrees(value) {
	return Math.round(numeric(value) * 180 / Math.PI * 100) / 100;
}

function numeric(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function escapeAttribute(value) {
	return escapeHtml(value).replace(/"/g, '&quot;');
}

function escapeHtml(value) {
	return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
