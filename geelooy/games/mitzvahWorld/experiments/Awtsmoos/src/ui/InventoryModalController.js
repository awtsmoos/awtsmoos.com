// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalController.js
 * @description Activates and restores the Bag modal boundary exactly once per state transition.
 * The Awtsmoos preserves every hidden potential while one vessel stands before the player;
 * Awtsmoos.com restores focus, accessibility, scroll, and interaction without duplicated release.
 */

import { InventoryModalInteractionGuard } from './InventoryModalInteractionGuard.js';
import { captureModalEnvironment, restoreModalEnvironment } from './InventoryModalSnapshot.js';
import { INVENTORY_MODAL_DATASET } from './InventoryModalState.js';
import { installInventoryModalStyles } from './InventoryModalStyles.js';

export class InventoryModalController {
	constructor(host, panel, documentValue) {
		this.host = host;
		this.panel = panel;
		this.document = documentValue;
		this.active = false;
		this.records = [];
		this.guard = new InventoryModalInteractionGuard(documentValue, panel);
		this.backdrop = documentValue.createElement('div');
		this.backdrop.className = 'Awtsmoos-inventory-backdrop';
		this.backdrop.hidden = true;
		host.insertBefore(this.backdrop, panel);
		installInventoryModalStyles(documentValue);
	}

	activate() {
		if (this.active) {
			return false;
		}
		this.active = true;
		this.snapshot = this.captureState();
		this.records = captureModalEnvironment(this.document, this.host);
		this.setModalDataset('true');
		this.document.body.style.overflow = 'hidden';
		this.host.dataset.modalActive = 'true';
		this.panel.setAttribute('role', 'dialog');
		this.panel.setAttribute('aria-modal', 'true');
		this.backdrop.hidden = false;
		this.guard.activate();
		return true;
	}

	deactivate() {
		if (!this.active) {
			return false;
		}
		this.guard.deactivate();
		restoreModalEnvironment(this.records);
		this.records = [];
		this.restoreState(this.snapshot);
		this.backdrop.hidden = true;
		delete this.host.dataset.modalActive;
		this.active = false;
		this.snapshot.focused?.focus?.();
		return true;
	}

	captureState() {
		return {
			focused: this.document.activeElement,
			overflow: this.document.body.style.overflow,
			htmlDataset: this.document.documentElement.dataset[INVENTORY_MODAL_DATASET],
			bodyDataset: this.document.body.dataset[INVENTORY_MODAL_DATASET],
			role: attributeState(this.panel, 'role'),
			ariaModal: attributeState(this.panel, 'aria-modal')
		};
	}

	restoreState(snapshot) {
		this.document.body.style.overflow = snapshot.overflow;
		restoreDataset(this.document.documentElement, snapshot.htmlDataset);
		restoreDataset(this.document.body, snapshot.bodyDataset);
		restoreAttribute(this.panel, 'role', snapshot.role);
		restoreAttribute(this.panel, 'aria-modal', snapshot.ariaModal);
	}

	setModalDataset(value) {
		this.document.documentElement.dataset[INVENTORY_MODAL_DATASET] = value;
		this.document.body.dataset[INVENTORY_MODAL_DATASET] = value;
	}

	destroy() {
		this.deactivate();
		this.backdrop.remove();
	}
}

function attributeState(node, name) {
	return { present: node.hasAttribute(name), value: node.getAttribute(name) };
}

function restoreAttribute(node, name, state) {
	if (state.present) {
		node.setAttribute(name, state.value);
	} else {
		node.removeAttribute(name);
	}
}

function restoreDataset(node, value) {
	if (value === undefined) {
		delete node.dataset[INVENTORY_MODAL_DATASET];
	} else {
		node.dataset[INVENTORY_MODAL_DATASET] = value;
	}
}
