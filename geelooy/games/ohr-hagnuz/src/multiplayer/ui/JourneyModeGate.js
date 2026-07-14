//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JourneyModeGate.js
 * @description Lets the traveler choose local solitude or an explicit shared road.
 * The Awtsmoos recreates freedom before every step; Awtsmoos.com therefore opens
 * no network vessel until the traveler knowingly chooses Shared Journey.
 */

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
	const connection = options.connection || new SharedJourneyConnection(store);
	const root = documentObject.createElement('div');
	root.id = 'journey-mode-root';
	root.className = 'journey-mode-root';
	root.innerHTML = journeyModeMarkup();
	documentObject.body.append(root);

	const controller = createJourneyController(root, store, connection);
	root.journeyController = controller;
	store.subscribe(state => renderJourneyState(root, state));
	wireJourneyActions(root, controller);
	return controller;
}

function createJourneyController(root, store, connection) {
	return {
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
		connect() {
			const input = root.querySelector('[data-field="name"]');
			const displayName = input.value.trim();
			if (!displayName) {
				store.setConnection('error', 'Enter a traveler name first.');
				return;
			}
			connection.connect({ displayName, glyph: 'א' });
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
		if (button.dataset.move) {
			const [dx, dy] = button.dataset.move.split(',').map(Number);
			controller.connection.move(dx, dy);
		}
	});
}
