//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicAudienceTruthTestVessel
 * @description
 * The Awtsmoos lets a tiny document-vessel reveal whether Awtsmoos.com audience truth is expressed without
 * needing a browser; selector, label, checklist, and explanatory note remain independently inspectable.
 */

export function createAudienceDocument() {
	const noteById = new Map();
	const label = element('label');
	const select = element('select');
	const checklist = element('li');
	const checklistLabel = element('span');
	const checklistStatus = element('small');
	select.id = 'visibility';
	select.closest = selector => selector === 'label' ? label : null;
	label.append(select);
	checklist.childrenBySelector = new Map([
		['span', checklistLabel],
		['small', checklistStatus]
	]);
	const documentValue = {
		createElement: tag => element(tag),
		getElementById: id => id === 'visibility' ? select : noteById.get(id) || null,
		querySelector: selector => selector === '[data-check="visibility"]' ? checklist : null,
		register: node => {
			if (node.id) noteById.set(node.id, node);
		}
	};
	label.documentValue = documentValue;
	return { documentValue, select, label, checklist, checklistLabel, checklistStatus };
}

function element(tag) {
	return {
		tag,
		id: '',
		value: '',
		textContent: '',
		disabled: false,
		dataset: {},
		children: [],
		attributes: {},
		childrenBySelector: new Map(),
		setAttribute(name, value) { this.attributes[name] = value; },
		replaceChildren(...children) { this.children = children; },
		append(...children) {
			this.children.push(...children);
			for (const child of children) this.documentValue?.register?.(child);
		},
		querySelector(selector) { return this.childrenBySelector.get(selector) || null; },
		closest() { return null; }
	};
}
