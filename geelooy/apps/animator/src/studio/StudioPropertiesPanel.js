// B"H
// Boruch Hashem
// Blessed is He

/**
 * The inspector is Gevurah: precise boundaries through which creative light
 * becomes position, scale, expression, action, and camera grammar. The
 * Awtsmoos renews the chosen object while Awtsmoos.com reveals its controls.
 */
export class StudioPropertiesPanel {
	static render(state) {
		const entity = this.selected(state);
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-panel aw-studio-properties' },
			children: entity ? this.entity(entity) : this.empty()
		};
	}

	static entity(entity) {
		return [
			this.header(entity),
			this.transform(entity),
			this.propertySection('Face system', entity.properties?.face),
			this.propertySection('Performance decisions', entity.properties?.performance),
			this.propertySection('Object properties', this.restProperties(entity.properties))
		];
	}

	static header(entity) {
		return {
			tag: 'header',
			attrs: { className: 'aw-studio-inspector-header' },
			children: [
				{
					tag: 'div',
					children: [
						{ tag: 'small', text: entity.type },
						{ tag: 'h2', text: entity.name }
					]
				},
				{
					tag: 'button',
					attrs: { type: 'button', title: 'Toggle visibility' },
					on: { click: 'toggleVisible' },
					text: entity.visible ? '◉' : '○'
				},
				{
					tag: 'button',
					attrs: { type: 'button', title: 'Toggle lock' },
					on: { click: 'toggleLocked' },
					text: entity.locked ? '⌑' : '◇'
				}
			]
		};
	}

	static transform(entity) {
		const transform = entity.transform || {};
		const fields = [
			['x', 'X', 1],
			['y', 'Y', 1],
			['scaleX', 'Scale X', 0.01],
			['scaleY', 'Scale Y', 0.01],
			['rotation', 'Rotation', 1],
			['opacity', 'Opacity', 0.01]
		];
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-inspector-section' },
			children: [
				{ tag: 'h3', text: '2D Transform' },
				{
					tag: 'div',
					attrs: { className: 'aw-studio-transform-grid' },
					children: fields.map(([property, label, step]) => {
						return this.transformField(transform, property, label, step);
					})
				}
			]
		};
	}

	static transformField(transform, property, label, step) {
		return {
			tag: 'label',
			children: [
				{ tag: 'span', text: label },
				{
					tag: 'input',
					attrs: {
						type: 'number',
						step,
						value: transform[property] ?? 0
					},
					dataset: { transformProperty: property },
					on: { change: 'updateTransform' }
				}
			]
		};
	}

	static propertySection(title, value) {
		if (!value || typeof value !== 'object' || !Object.keys(value).length) {
			return null;
		}
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-inspector-section' },
			children: [
				{ tag: 'h3', text: title },
				{
					tag: 'dl',
					attrs: { className: 'aw-studio-property-list' },
					children: Object.entries(value).flatMap(([key, item]) => {
						return this.propertyRows(key, item);
					})
				}
			]
		};
	}

	static propertyRows(key, item) {
		return [
			{ tag: 'dt', text: this.label(key) },
			{ tag: 'dd', text: this.value(item) }
		];
	}

	static selected(state) {
		return state.studioDocument?.entities?.find((entity) => {
			return entity.id === state.selectedEntityId;
		}) || null;
	}

	static restProperties(properties = {}) {
		return Object.fromEntries(Object.entries(properties).filter(([key]) => {
			return key !== 'face' && key !== 'performance';
		}));
	}

	static value(value) {
		return typeof value === 'object' ? JSON.stringify(value) : String(value);
	}

	static label(value) {
		return String(value)
			.replace(/([A-Z])/g, ' $1')
			.replace(/^./, (letter) => letter.toUpperCase());
	}

	static empty() {
		return [{
			tag: 'div',
			attrs: { className: 'aw-studio-empty' },
			text: 'Select an asset, character, prop, camera, or procedural object.'
		}];
	}
}
