// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalTestDoubles.mjs
 * @description Assembles the modal tree and synthetic events from focused node vessels.
 * The Awtsmoos preserves every prior condition while the Bag receives attention;
 * Awtsmoos.com lets tests count restoration and suppression without oversized helper files.
 */

import { ModalDocumentDouble } from './InventoryModalDocumentDouble.mjs';
import { ModalNodeDouble } from './InventoryModalNodeDouble.mjs';

export function createInventoryModalFixture() {
	const documentValue = new ModalDocumentDouble();
	const world = new ModalNodeDouble(documentValue);
	const worldFocus = focusableNode(documentValue);
	world.setAttribute('aria-hidden', 'false');
	world.append(worldFocus);
	const container = new ModalNodeDouble(documentValue);
	const otherHud = new ModalNodeDouble(documentValue);
	otherHud.inert = true;
	const host = new ModalNodeDouble(documentValue);
	const panel = new ModalNodeDouble(documentValue, 'section');
	panel.setAttribute('role', 'region');
	const close = focusableNode(documentValue);
	close.dataset.close = '';
	const item = focusableNode(documentValue);
	panel.append(close, item);
	host.append(panel);
	container.append(otherHud, host);
	documentValue.body.append(world, container);
	documentValue.body.style.overflow = 'scroll';
	documentValue.documentElement.dataset.inventoryModalOpen = 'legacy';
	documentValue.activeElement = worldFocus;
	return { close, container, documentValue, host, item, otherHud, panel, world, worldFocus };
}

export function modalEvent(target, type, key = '') {
	return {
		key,
		prevented: 0,
		propagationStops: 0,
		immediateStops: 0,
		shiftKey: false,
		stopImmediatePropagation() {
			this.immediateStops += 1;
		},
		stopPropagation() {
			this.propagationStops += 1;
		},
		preventDefault() {
			this.prevented += 1;
		},
		target,
		type
	};
}

function focusableNode(documentValue) {
	const node = new ModalNodeDouble(documentValue, 'button');
	node.focusable = true;
	return node;
}
