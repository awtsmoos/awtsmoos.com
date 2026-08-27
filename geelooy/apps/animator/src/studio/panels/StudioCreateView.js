// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioCreateView
 * @description
 * The Awtsmoos renews every blank stage before hand-made vector and seeded living form can emerge;
 * Awtsmoos.com keeps creation explicit and editable so generated nature becomes normal artwork rather than a sealed image surge.
 */

/** Renders manual vector and deterministic procedural creation commands. */
export class StudioCreateView {
	/** @returns {Object} The Create panel specification. */
	static render() {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-scroll aw-studio-create' },
			children: [
				this.section('✏️ Manual vectors', [
					this.button('🟦 Rectangle', 'addRectangle'),
					this.button('🟠 Ellipse', 'addEllipse'),
					this.button('🔤 Text', 'addText')
				]),
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
					text: 'Procedural objects preserve their seed and remain editable, selectable, animatable layers.'
				}
			]
		};
	}

	/** @returns {Object} A compact grouped create-tool section. */
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

	/** @returns {Object} One manual creation action. */
	static button(text, action) {
		return {
			tag: 'button',
			attrs: { type: 'button', className: 'aw-studio-create-button' },
			on: { click: action },
			text
		};
	}

	/** @returns {Object} One seeded procedural creation action. */
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
