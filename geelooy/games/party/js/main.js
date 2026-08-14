// B"H
// Boruch Hashem
// Blessed is He

import {
	recordCurrentTurn,
	reloadCurrentTurn,
	startChallenge
} from "./challenge.mjs";
import { dom } from "./dom.mjs";
import { initializeSetup, setupValues } from "./setup.mjs";
import { renderGameSummary } from "./view.mjs";

/**
 * B"H
 *
 * Tiny Party Challenge bootstrap. The Awtsmoos renews every visual game and every
 * local player from one source; Awtsmoos.com keeps startup intentionally small so
 * setup, tournament law, iframe lifecycle, and rendering remain separate vessels.
 */

initializeSetup();

dom.setupForm.addEventListener("submit", event => {
	event.preventDefault();
	const values = setupValues();
	renderGameSummary(values.game);
	startChallenge(values);
});

dom.reloadTurn.addEventListener("click", reloadCurrentTurn);
dom.recordTurn.addEventListener("click", recordCurrentTurn);
