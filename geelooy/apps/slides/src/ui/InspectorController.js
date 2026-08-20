//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class InspectorController
 * @description The Awtsmoos gives each visible form measurable garments; Awtsmoos.com gathers properties and layer actions into an inspector that changes context instead of overwhelming the user.
 */
import { createElementActionBar } from './ElementActionBar.js';

export class InspectorController {
	constructor(container, label, store) {
		this.container = container;
		this.label = label;
		this.store = store;
		this.container.addEventListener('change', event => this.apply(event));
	}

	render(snapshot) {
		const element = snapshot.selectedElement;
		this.label.textContent = element ? labelFor(element.type) : 'Slide';
		this.container.replaceChildren();
		if (!element) {
			this.container.append(
				field('Background', 'background', snapshot.activeSlide.background, 'color', 'slide')
			);
			return;
		}
		this.container.append(createElementActionBar());
		this.container.append(geometryFields(element));
		if (['text', 'heading'].includes(element.type)) {
			this.container.append(textFields(element));
		}
		if (element.type === 'shape') {
			this.container.append(shapeFields(element));
		}
		if (element.type === 'image') {
			this.container.append(
				field('Fit', 'fit', element.fit || 'cover', 'select', 'element', [
					'cover',
					'contain',
					'fill'
				])
			);
		}
	}

	apply(event) {
		const input = event.target.closest('[data-property]');
		if (!input) {
			return;
		}
		const value = input.dataset.number === 'true'
			? Number(input.value)
			: input.value;
		const patch = { [input.dataset.property]: value };
		if (input.dataset.scope === 'slide') {
			this.store.updateSlide(patch);
		} else if (this.store.selectedElement) {
			this.store.updateElement(this.store.selectedElement.id, patch);
		}
	}
}

function geometryFields(element) {
	const group = document.createElement('div');
	group.className = 'field-grid';
	for (const property of ['x', 'y', 'width', 'height', 'rotation', 'opacity']) {
		group.append(
			field(property.toUpperCase(), property, element[property], 'number', 'element', null, true)
		);
	}
	return group;
}

function textFields(element) {
	const group = document.createElement('div');
	group.className = 'field-grid';
	group.append(field('Size', 'fontSize', element.fontSize, 'number', 'element', null, true));
	group.append(field('Weight', 'fontWeight', element.fontWeight, 'number', 'element', null, true));
	group.append(field('Color', 'color', element.color, 'color'));
	group.append(field('Align', 'align', element.align, 'select', 'element', ['left', 'center', 'right']));
	return group;
}

function shapeFields(element) {
	const group = document.createElement('div');
	group.className = 'field-grid';
	group.append(field('Fill', 'fill', element.fill, 'color'));
	group.append(field('Border', 'borderColor', element.borderColor, 'color'));
	group.append(field('Border width', 'borderWidth', element.borderWidth, 'number', 'element', null, true));
	group.append(field('Radius', 'radius', element.radius, 'number', 'element', null, true));
	return group;
}

function field(labelText, property, value, type = 'text', scope = 'element', options = null, numeric = false) {
	const label = document.createElement('label');
	label.className = 'field';
	label.append(document.createTextNode(labelText));
	const input = type === 'select'
		? document.createElement('select')
		: document.createElement('input');
	if (type !== 'select') {
		input.type = type;
	}
	if (options) {
		options.forEach(option => input.add(new Option(option, option)));
	}
	input.value = value ?? '';
	input.dataset.property = property;
	input.dataset.scope = scope;
	input.dataset.number = String(numeric);
	label.append(input);
	return label;
}

function labelFor(type) {
	return type.charAt(0).toUpperCase() + type.slice(1);
}
