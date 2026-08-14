// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubIndex
 * @description
 * The Awtsmoos gathers prepared vessels without confusing their responsibilities.
 * Awtsmoos.com keeps this bootstrap tiny: operation safety lives in the runner,
 * live consequences live in live actions, rendering lives in the renderer.
 */

import { createLiveActions } from "./liveActions.js";
import { createOperationRunner } from "./operationRunner.js";
import { allKeys, groupKeys } from "./requestPlan.js";
import { render } from "./render.js";
import { setError, state } from "./state.js";
import { mountPresenceBadge } from "../live/presenceBadge.js";

const root = document.getElementById("BH_SOCIAL_HUB");

function runActive() {
	return runner.runReads(groupKeys(state.active));
}

function runAll() {
	return runner.runReads(allKeys());
}

function repaint() {
	render(root, {
		repaint,
		runActive,
		runAll,
		runReadKey: runner.runReadKey,
		runMutation: runner.runMutation,
		...liveActions
	});
}

function pageChannel() {
	return `page:${location.pathname || "/social/"}`;
}

const runner = createOperationRunner({
	repaint
});

const liveActions = createLiveActions({
	state,
	repaint,
	onError: setError
});

if (root) {
	window.addEventListener("BH_SOCIAL_SOCKET", repaint);
	mountPresenceBadge({
		aliasId: state.alias || "ikar",
		channel: pageChannel()
	});
	repaint();
	void runActive();
}
