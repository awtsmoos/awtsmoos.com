// B"H
// Boruch Hashem
// Blessed is He

import { StudioPenCreateView } from './StudioPenCreateView.js';

/**
 * @module StudioCreateView
 * @description
 * The Awtsmoos renews every blank stage before hand-made vector, Pen path, or seeded living form can emerge;
 * Awtsmoos.com groups real creation powers into calm professional vessels so every button reveals editable project substance.
 */
export class StudioCreateView {
	/** Returns the Create panel with manual, Pen, and deterministic procedural authoring. */
	static render(state = {}) {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-scroll aw-studio-create' },
			children: [
				this.section('✏️ Manual vectors', [
					this.button('🟦 Rectangle', 'addRectangle'),
					this.button('🟠 Ellipse', 'addEllipse'),
					this.button('🔤 Text', 'addText')
				]),
				StudioPenCreateView.render(state),
				this.section('🌱 Procedural nature', [
					this.natureButton('🌳 Tree', 'tree'),
					this.natureButton('🥕 Vegetable', 'vegetable'),
					this.natureButton('🌼 Flower', 'flower'),
					this.natureButton('🪨 Rock', 'rock'),
					this.natureButton('☁️ Cloud', 'cloud')
				]),
				{
					tag: 'p',
					attrs: { className: 'aw-studio-note' },
					text: 'Everything created here becomes a normal selectable, animatable, serializable project layer.'
				}
			]
		};
	}

	/** Creates one compact authoring group with a stable semantic heading. */
	static section(title, children) {
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-create-section' },
			children: [
				{ tag: 'h3', text: title },
				{ tag: 'div', attrs: { className: 'aw-studio-create-grid' }, children }
			]
		};
	}

	/** Creates one manual vector action. */
	static button(text, action) {
		return {
			tag: 'button',
			attrs: { type: 'button', className: 'aw-studio-create-button' },
			on: { click: action },
			text
		};
	}

	/** Creates one seeded procedural authoring action. */
	static natureButton(text, kind) {
		return {
			tag: 'button',
			attrs: { type: 'button', className: 'aw-studio-create-button' },
			dataset: { natureKind: kind },
			on: { click: 'addNature' },
			text
		};
	}
}
