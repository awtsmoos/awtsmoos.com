//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module InteractiveControllerActivation
 * @description
 * Manifests the small host-side bindings that make one authenticated Chromium target
 * visible and interactive without crowding navigation/session lifecycle code.
 */

import { inputInteractiveTarget } from "./interactiveClient.js";
import { bindInteractiveInput } from "./interactiveInput.js";
import { createInteractivePopupBridge } from "./interactivePopupBridge.js";

/**
 * Activates frame polling, popup discovery, and bounded user input for one target.
 * @param {object} context Active browser controller dependencies.
 * @returns {{inputDispose:Function,popupBridge:object}} Active binding handles.
 */
export function activateInteractiveController(context) {
	context.surface.setVisible(true);
	const popupBridge = createPopupBridge(context);
	context.inputDispose?.();
	const inputDispose = bindInteractiveInput({
		frame: context.surface.frame,
		getViewport: context.surface.getViewport,
		send: event => inputInteractiveTarget({ ...context.state, event })
	});
	context.viewSync.start();
	context.options.setStatus?.("Interactive Chromium connected");
	return {
		inputDispose,
		popupBridge
	};
}

/** Builds popup lineage testimony for newly discovered child page targets. */
function createPopupBridge(context) {
	return createInteractivePopupBridge({
		aliasId: context.state.aliasId,
		currentTargetId: context.state.targetId,
		engineMode: context.state.engineMode,
		initialTargetIds: [context.state.targetId],
		jarId: context.state.jarId,
		os: context.options.os,
		sessionId: context.state.sessionId
	});
}
