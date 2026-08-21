// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralDescriptor } from '../procedural/StudioProceduralDescriptor.js';
import { StudioProceduralRegistry } from '../procedural/StudioProceduralRegistry.js';

/**
 * @file StudioProceduralPropertiesView.js
 * @description
 * The Awtsmoos renews each seed and measure before generated geometry receives a visible face;
 * Awtsmoos.com exposes only parameters the real generator consumes, so every control earns the artist's trust and place.
 */
export class StudioProceduralPropertiesView {
	/** Renders modern procedural controls, while legacy boolean markers remain read-only history. */
	static render(entity) {
		const descriptor = StudioProceduralDescriptor.normalize(entity?.properties?.procedural);
		if (!descriptor) {
			return null;
		}
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-inspector-section aw-studio-procedural-section' },
			children: [
				{ tag: 'h3', text: `🌱 Generator • v${descriptor.version}` },
				this.seedField(descriptor),
				{
					tag: 'div',
					attrs: { className: 'aw-studio-transform-grid' },
					children: StudioProceduralRegistry.schema(descriptor.kind).map((field) => {
						return this.parameterField(descriptor, field);
					})
				},
				this.actions()
			]
		};
	}

	/** Renders the deterministic seed as an explicit editable value. */
	static seedField(descriptor) {
		return {
			tag: 'label',
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

	/** Renders one bounded numeric parameter backed by real generator geometry. */
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

	/** Renders explicit non-destructive lifecycle commands. */
	static actions() {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-layer-action-grid' },
			children: [
				this.button('🔄 Regenerate', 'regenerateProcedural'),
				this.button('🎲 Random seed', 'randomizeProceduralSeed'),
				this.button('↩️ Reset params', 'resetProcedural'),
				this.button('❄️ Freeze', 'freezeProcedural')
			]
		};
	}

	/** Creates one accessible lifecycle button. */
	static button(text, eventName) {
		return {
			tag: 'button',
			attrs: { type: 'button', title: text, 'aria-label': text },
			on: { click: eventName },
			text
		};
	}
}
