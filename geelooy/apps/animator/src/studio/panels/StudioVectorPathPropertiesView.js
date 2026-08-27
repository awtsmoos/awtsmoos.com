// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioVectorPathPropertiesView.js
 * @description
 * The Awtsmoos renews every stroke and fill before appearance becomes a property;
 * Awtsmoos.com exposes only Canvas2D path capabilities the production renderer truly honors, preserving trust from inspector to export.
 */
export class StudioVectorPathPropertiesView {
	/** Renders path styling controls only for a real selected vector path. */
	static render(entity) {
		const spec = entity?.properties?.renderSpec;
		if (entity?.type !== 'vector-path' || spec?.type !== 'path') {
			return null;
		}
		const fillEnabled = Boolean(spec.fill);
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-inspector-section aw-studio-vector-path-section' },
			children: [
				{ tag: 'h3', text: '✒️ Vector path' },
				{
					tag: 'div',
					attrs: { className: 'aw-studio-transform-grid' },
					children: [
						this.colorField('Stroke', spec.stroke || '#7db4ff', 'updateVectorPathStroke'),
						this.numberField('Width', spec.lineWidth ?? 4, 'updateVectorPathWidth'),
						this.selectField('Cap', spec.lineCap || 'round', ['butt', 'round', 'square'], 'updateVectorPathCap'),
						this.selectField('Join', spec.lineJoin || 'round', ['miter', 'round', 'bevel'], 'updateVectorPathJoin')
					]
				},
				this.toggleField('Closed path', Boolean(spec.close), 'toggleVectorPathClosed'),
				this.toggleField('Enable fill', fillEnabled, 'toggleVectorPathFill'),
				this.colorField('Fill', fillEnabled ? spec.fill : '#6ea8ff', 'updateVectorPathFill', !fillEnabled)
			]
		};
	}

	/** Creates one accessible color input backed by a real render-spec field. */
	static colorField(label, value, eventName, disabled = false) {
		return {
			tag: 'label',
			children: [
				{ tag: 'span', text: label },
				{
					tag: 'input',
					attrs: { type: 'color', value, disabled, 'aria-label': `Vector path ${label.toLowerCase()}` },
					on: { change: eventName }
				}
			]
		};
	}

	/** Creates one bounded stroke-width field. */
	static numberField(label, value, eventName) {
		return {
			tag: 'label',
			children: [
				{ tag: 'span', text: label },
				{
					tag: 'input',
					attrs: { type: 'number', min: 0.5, max: 128, step: 0.5, value, inputmode: 'decimal', 'aria-label': `Vector path ${label.toLowerCase()}` },
					on: { change: eventName }
				}
			]
		};
	}

	/** Creates one Canvas2D-supported cap or join selector. */
	static selectField(label, current, values, eventName) {
		return {
			tag: 'label',
			children: [
				{ tag: 'span', text: label },
				{
					tag: 'select',
					attrs: { 'aria-label': `Vector path ${label.toLowerCase()}` },
					on: { change: eventName },
					children: values.map((value) => ({
						tag: 'option',
						attrs: { value, selected: value === current },
						text: value
					}))
				}
			]
		};
	}

	/** Creates one boolean path behavior control. */
	static toggleField(label, checked, eventName) {
		return {
			tag: 'label',
			attrs: { className: 'aw-studio-path-toggle' },
			children: [
				{
					tag: 'input',
					attrs: { type: 'checkbox', checked, 'aria-label': label },
					on: { change: eventName }
				},
				{ tag: 'span', text: label }
			]
		};
	}
}
