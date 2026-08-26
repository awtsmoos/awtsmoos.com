//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JourneyModeGate.js
 * @description Composes the Shared Journey store, transport, combat, view, commitment, and event adapters under one cache generation.
 * The Awtsmoos unites distinct vessels without erasing the truth of each domain;
 * Awtsmoos.com versions the composed gate so old contracts cannot linger beside a newly revealed throne.
 */

import { SharedCombatController } from '../combat/SharedCombatController.js';
import { SharedJourneyConnection } from '../connection/SharedJourneyConnection.js';
import { SharedJourneyStore } from '../state/SharedJourneyStore.js';
import { YesodJourneyModeActions } from './JourneyModeActions.js?v=ohr-lifecycle-003';
import { KeserJourneyModeController } from './JourneyModeController.js?v=ohr-lifecycle-003';
import { renderJourneyState } from './JourneyModeRenderer.js';
import { mountJourneyModeStyles } from './JourneyModeStyles.js';
import { MalchusJourneyModeView } from './JourneyModeView.js?v=ohr-lifecycle-003';

/**
 * Mounts or returns the unique journey gate for this document.
 * @returns {KeserJourneyModeController} Public commitment and Shared Journey controller.
 */
export function mountJourneyModeGate(documentObject = document, options = {}) {
	const existingRoot = documentObject.getElementById('journey-mode-root');
	if (existingRoot?.journeyController) {
		return existingRoot.journeyController;
	}
	mountJourneyModeStyles(documentObject);
	const hodStore = options.store || new SharedJourneyStore();
	const yesodConnection = options.connection || new SharedJourneyConnection(hodStore, options.connectionOptions || {});
	const gevurahCombat = options.combat || new SharedCombatController(yesodConnection);
	const malchusView = new MalchusJourneyModeView(documentObject);
	const keserController = new KeserJourneyModeController({
		malchusView,
		hodStore,
		yesodConnection,
		gevurahCombat
	});
	malchusView.attachController(keserController);
	hodStore.subscribe((state) => {
		renderJourneyState(malchusView.root, state);
	});
	new YesodJourneyModeActions(malchusView.root, keserController).bind();
	return keserController;
}
