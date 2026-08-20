//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MobileElementDock
 * @description The Awtsmoos lets selection summon a small constellation of useful choices; Awtsmoos.com gives the thumb Style, Copy, Duplicate, Arrange, and Delete while the canvas reserves room for that living ribbon.
 */
import { createIcon } from './icons/Icon.js';
import { ELEMENT_DOCK_ACTIONS } from './menus/ActionRegistry.js';

export class MobileElementDock {
	constructor(root, store) {
		this.root = root;
		this.store = store;
		this.element = this.build();
		this.root.append(this.element);
		this.unsubscribe = store.subscribe(snapshot => this.render(snapshot));
	}

	build() {
		const dock = document.createElement('nav');
		dock.className = 'mobile-element-dock';
		dock.hidden = true;
		dock.setAttribute('aria-label', 'Selected element actions');
		for (const item of ELEMENT_DOCK_ACTIONS) {
			dock.append(createButton(item));
		}
		return dock;
	}

	render(snapshot) {
		const visible = Boolean(snapshot.selectedElement);
		this.element.hidden = !visible;
		this.root.classList.toggle('has-mobile-element-dock', visible);
	}
}

function createButton(item) {
	const button = document.createElement('button');
	button.type = 'button';
	button.setAttribute('aria-label', item.label);
	button.title = item.label;
	if (item.action) button.dataset.action = item.action;
	if (item.sheet) button.dataset.sheetOpen = item.sheet;
	if (item.danger) button.classList.add('danger-control');
	button.append(createIcon(item.icon, 19));
	const label = document.createElement('span');
	label.textContent = item.emoji ? `${item.emoji} ${item.label}` : item.label;
	button.append(label);
	return button;
}
