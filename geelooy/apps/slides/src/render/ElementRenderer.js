//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ElementRenderer
 * @description The Awtsmoos renews data into visible form; Awtsmoos.com lets text, image, and shape remain one schema while selected authoring vessels reveal gentle resize corners.
 */
import { appendSelectionHandles } from './SelectionHandles.js';

/** Creates one safe DOM representation of a slide element. */
export function renderElement(element, selectedId = null) {
	const wrapper = document.createElement('div');
	const isSelected = element.id === selectedId;
	wrapper.className = `slide-element${isSelected ? ' is-selected' : ''}`;
	wrapper.dataset.elementId = element.id;
	wrapper.dataset.elementType = element.type;
	applyGeometry(wrapper, element);
	if (element.type === 'image') {
		wrapper.append(createImage(element));
	} else if (element.type === 'shape') {
		wrapper.append(createShape(element));
	} else {
		wrapper.append(createText(element));
	}
	if (isSelected) {
		appendSelectionHandles(wrapper);
	}
	return wrapper;
}

/** Paints percentage geometry so the stage scales without changing the document. */
function applyGeometry(node, element) {
	node.style.left = `${element.x}%`;
	node.style.top = `${element.y}%`;
	node.style.width = `${element.width}%`;
	node.style.height = `${element.height}%`;
	node.style.opacity = String(element.opacity ?? 1);
	node.style.transform = `rotate(${element.rotation || 0}deg)`;
}

function createText(element) {
	const node = document.createElement('div');
	node.className = 'slide-text';
	node.textContent = element.text || '';
	node.style.fontFamily = element.fontFamily || 'inherit';
	node.style.fontSize = `${(element.fontSize || 24) / 9.6}cqw`;
	node.style.fontWeight = String(element.fontWeight || 500);
	node.style.color = element.color || '#ffffff';
	node.style.textAlign = element.align || 'left';
	return node;
}

function createImage(element) {
	const node = document.createElement('img');
	node.className = 'slide-image';
	node.src = element.src || '';
	node.alt = element.alt || '';
	node.draggable = false;
	node.style.objectFit = element.fit || 'cover';
	return node;
}

function createShape(element) {
	const node = document.createElement('div');
	node.className = 'slide-shape';
	node.style.background = element.fill || '#6d5dfc';
	node.style.border = `${element.borderWidth || 0}px solid ${element.borderColor || '#ffffff'}`;
	node.style.borderRadius = element.shape === 'circle'
		? '50%'
		: `${element.radius || 0}px`;
	return node;
}
