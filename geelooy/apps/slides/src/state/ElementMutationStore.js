//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ElementMutationStore
 * @description The Awtsmoos renews each element without confusing one vessel for the whole deck; Awtsmoos.com gathers element creation, duplication, layering, editing, and removal beneath the presentation command layer.
 */
import { createElement, createElementId } from '../model/ElementFactory.js';
import { clonePresentation } from '../model/PresentationDocument.js';
import { BasePresentationStore } from './BasePresentationStore.js';

export class ElementMutationStore extends BasePresentationStore {
	addElement(type, overrides = {}) {
		const element = createElement(type, overrides);
		this.commit('add-element', draft => {
			this.findSlide(draft).elements.push(element);
		});
		this.selectElement(element.id);
	}

	updateElement(id, patch, options = {}) {
		const existing = this.activeSlide?.elements.find(element => element.id === id);
		if (!existing) {
			return;
		}
		this.commit('update-element', draft => {
			const element = this.findElement(draft, id);
			if (element) {
				Object.assign(element, patch);
			}
		}, options);
	}

	deleteSelectedElement() {
		if (!this.selectedElementId) {
			return;
		}
		const id = this.selectedElementId;
		this.commit('delete-element', draft => {
			const slide = this.findSlide(draft);
			slide.elements = slide.elements.filter(element => element.id !== id);
		});
		this.selectedElementId = null;
	}

	duplicateSelectedElement() {
		if (!this.selectedElement) {
			return null;
		}
		const duplicate = clonePresentation({ element: this.selectedElement }).element;
		duplicate.id = createElementId(duplicate.type);
		duplicate.x = Number(duplicate.x || 0) + 2;
		duplicate.y = Number(duplicate.y || 0) + 2;
		this.commit('duplicate-element', draft => {
			this.findSlide(draft).elements.push(duplicate);
		});
		this.selectElement(duplicate.id);
		return duplicate.id;
	}

	moveSelectedElementLayer(direction) {
		if (!this.selectedElementId) {
			return;
		}
		this.commit('reorder-element', draft => {
			const elements = this.findSlide(draft).elements;
			const index = elements.findIndex(element => element.id === this.selectedElementId);
			const target = layerTarget(index, elements.length, direction);
			if (index < 0 || target === index) {
				return;
			}
			const [element] = elements.splice(index, 1);
			elements.splice(target, 0, element);
		});
	}
}

function layerTarget(index, length, direction) {
	if (index < 0 || length < 2) {
		return index;
	}
	if (direction === 'front') {
		return length - 1;
	}
	if (direction === 'back') {
		return 0;
	}
	if (direction === 'forward') {
		return Math.min(length - 1, index + 1);
	}
	if (direction === 'backward') {
		return Math.max(0, index - 1);
	}
	return index;
}
