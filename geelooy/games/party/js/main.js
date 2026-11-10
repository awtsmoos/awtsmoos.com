// B"H
// Boruch Hashem
// Blessed is He

import {
	hasRecordedScores,
	recordAutomatedTurn,
	recordCurrentTurn,
	reloadCurrentTurn,
	resetToSetup,
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
	if (hasRecordedScores() && !window.confirm("Starting a new challenge will discard the current standings. Continue?")) {
		return;
	}
	const values = setupValues();
	renderGameSummary(values.game);
	startChallenge(values);
});

dom.reloadTurn.addEventListener("click", reloadCurrentTurn);
dom.newChallenge.addEventListener("click", resetToSetup);
dom.recordTurn.addEventListener("click", recordCurrentTurn);
