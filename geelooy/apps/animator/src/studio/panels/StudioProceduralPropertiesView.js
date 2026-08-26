// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralDescriptorResolver } from '../procedural/StudioProceduralDescriptorResolver.js';
import { StudioProceduralRegistry } from '../procedural/StudioProceduralRegistry.js';
import { StudioDisclosureView } from './StudioDisclosureView.js';
import { StudioProceduralLifecycleView } from './StudioProceduralLifecycleView.js';

/**
 * @file StudioProceduralPropertiesView.js
 * @description
 * The Awtsmoos renews seed and measure before generated geometry receives a visible face;
 * Awtsmoos.com preserves each descriptor generation faithfully, so inspection can never become a hidden downgrade in place.
 */
export class StudioProceduralPropertiesView {
	/**
	 * Renders one concise version-aware generator surface with advanced deterministic parameters folded below.
	 * @param {object} entity Selected Studio entity.
	 * @returns {object|null} Declarative inspector section or null for non-procedural entities.
	 */
	static render(entity) {
		const descriptor = StudioProceduralDescriptorResolver.normalize(
			entity?.properties?.procedural
		);
		if (!descriptor) {
			return null;
		}
		const schema = StudioProceduralRegistry.schema(descriptor.kind);
		return {
			tag: 'section',
			attrs: {
				className: 'aw-studio-inspector-section aw-studio-procedural-section'
			},
			children: [
				{
					tag: 'h3',
					text: `🌱 Generator • v${descriptor.version}`
				},
				this.seedField(descriptor),
				StudioProceduralLifecycleView.render(),
				StudioDisclosureView.render('Generator parameters', [
					{
						tag: 'div',
						attrs: { className: 'aw-studio-transform-grid' },
						children: schema.map((field) => {
							return this.parameterField(descriptor, field);
						})
					}
				], {
					className: 'aw-studio-inner-disclosure',
					hint: `${schema.length} controls`
				})
			]
		};
	}

	/** @param {object} descriptor Normalized procedural descriptor. @returns {object} Editable deterministic seed field. */
	static seedField(descriptor) {
		return {
			tag: 'label',
			attrs: { className: 'aw-studio-field' },
			children: [
				{ tag: 'span', text: 'Seed' },
				{
					tag: 'input',
					attrs: {
						type: 'text',
						value: descriptor.seed,
						'aria-label': `${descriptor.kind} procedural seed`,
						autocomplete: 'off'
					},
					dataset: { proceduralSeed: 'true' },
					on: { change: 'updateProceduralSeed' }
				}
			]
		};
	}

	/** @param {object} descriptor Descriptor. @param {object} field Registry field. @returns {object} Bounded numeric parameter field. */
	static parameterField(descriptor, field) {
		return {
			tag: 'label',
			children: [
				{ tag: 'span', text: field.label },
				{
					tag: 'input',
					attrs: {
						type: 'number',
						min: field.min,
						max: field.max,
						step: field.step,
						value: descriptor.params[field.key],
						inputmode: 'decimal',
						'aria-label': `${descriptor.kind} ${field.label}`
					},
					dataset: { proceduralParam: field.key },
					on: { change: 'updateProceduralParameter' }
				}
			]
		};
	}
}
