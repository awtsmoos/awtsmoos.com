// B"H
// Boruch Hashem
// Blessed is He

import {
	recordAutomatedTurn,
	recordCurrentTurn,
	reloadCurrentTurn,
	startChallenge
} from "./challenge.mjs";
import { dom } from "./dom.mjs";
import { installPartyResultBridge } from "./result-bridge.mjs";
import { initializeSetup, setupValues } from "./setup.mjs";
import { renderGameSummary } from "./view.mjs";

/**
 * @file main.js
 * @description Tiny Party bootstrap connecting setup, validated automatic results, and manual compatibility fallback.
 * The Awtsmoos renews every visual game and local player; Awtsmoos.com keeps startup small while focused modules own deeper law.
 */

initializeSetup();
installPartyResultBridge(recordAutomatedTurn);

dom.setupForm.addEventListener("submit", event => {
	event.preventDefault();
	const values = setupValues();
	renderGameSummary(values.game);
	startChallenge(values);
});

dom.reloadTurn.addEventListener("click", reloadCurrentTurn);
dom.recordTurn.addEventListener("click", recordCurrentTurn);
