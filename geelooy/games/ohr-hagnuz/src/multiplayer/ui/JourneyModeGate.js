//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JourneyModeGate.js
 * @description Lets the traveler choose local solitude or authenticated fellowship.
 * The Awtsmoos recreates freedom before every step; Awtsmoos.com opens no ticket,
 * socket, reconnect proof, or combat vessel until Shared Journey is chosen.
 */

import { SharedCombatController } from '../combat/SharedCombatController.js';
import { SharedJourneyConnection } from '../connection/SharedJourneyConnection.js';
import { SharedJourneyStore } from '../state/SharedJourneyStore.js';
import { journeyModeMarkup } from './JourneyModeMarkup.js';
import { renderJourneyState } from './JourneyModeRenderer.js';
import { mountJourneyModeStyles } from './JourneyModeStyles.js';

export function mountJourneyModeGate(documentObject = document, options = {}) {
	const existing = documentObject.getElementById('journey-mode-root');
	if (existing?.journeyController) return existing.journeyController;
	mountJourneyModeStyles(documentObject);
	const store = options.store || new SharedJourneyStore();
	const connection = options.connection || new SharedJourneyConnection(
		store,
		options.connectionOptions || {}
	);
	const combat = options.combat || new SharedCombatController(connection);
	const root = documentObject.createElement('div');
	root.id = 'journey-mode-root';
	root.className = 'journey-mode-root';
	root.innerHTML = journeyModeMarkup();
	documentObject.body.append(root);
	const controller = createJourneyController(root, store, connection, combat);
	root.journeyController = controller;
	store.subscribe(state => renderJourneyState(root, state));
	wireJourneyActions(root, controller);
	return controller;
}

function createJourneyController(root, store, connection, combat) {
	return {
		combat,
		connection,
		store,
		chooseSolo() {
			connection.disconnect();
			store.reset();
			root.hidden = true;
		},
		show() {
			root.hidden = false;
		},
		showShared() {
			root.querySelector('[data-view="choices"]').hidden = true;
			root.querySelector('[data-view="shared"]').hidden = false;
			root.querySelector('[data-field="name"]').focus();
		},
		async connect() {
			const displayName = fieldValue(root, 'name');
			const slot = normalizeSlot(fieldValue(root, 'slot'));
			if (!displayName || !slot) {
				store.setConnection('error', 'Enter a safe traveler name and character slot.');
				return;
			}
			try {
				await connection.connect({ displayName, glyph: 'א', slot });
			} catch (error) {
				store.setConnection('error', error.message);
			}
		}
	};
}

function wireJourneyActions(root, controller) {
	root.addEventListener('click', event => {
		const button = event.target.closest('button');
		if (!button) return;
		const action = button.dataset.action;
		if (action === 'solo') controller.chooseSolo();
		if (action === 'shared') controller.showShared();
		if (action === 'connect') controller.connect();
		if (action === 'lamp') controller.connection.interact();
		if (action === 'attack') controller.combat.attackVeilWisp();
		if (button.dataset.move) {
			const [dx, dy] = button.dataset.move.split(',').map(Number);
			controller.connection.move(dx, dy);
		}
	});
}

function fieldValue(root, name) {
	return root.querySelector(`[data-field="${name}"]`)?.value.trim() || '';
}

function normalizeSlot(value) {
	const slot = value.toLowerCase();
	return /^[a-z0-9-]{1,32}$/.test(slot) ? slot : '';
}
