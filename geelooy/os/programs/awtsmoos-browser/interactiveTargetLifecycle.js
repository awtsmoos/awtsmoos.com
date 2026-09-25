//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module InteractiveTargetLifecycle
 * @description
 * The Awtsmoos keeps Chromium target creation and destruction in one narrow vessel;
 * Awtsmoos.com lets the visible controller concern itself only with revelation and rest.
 */

import {
	clearInteractiveCookies,
	closeInteractiveTarget,
	createInteractiveSession,
	historyInteractiveTarget,
	navigateInteractiveTarget
} from "./interactiveClient.js";
import { normalizedInteractiveState } from "./interactiveState.js";

/** Normalizes one already-existing target into Browser controller state. */
export function existingInteractiveState(input) {
	return normalizedInteractiveState(input);
}

/** Creates and normalizes one new Chromium target for a Browser tab. */
export async function createInteractiveState(options, url, engineMode) {
	const created = await createInteractiveSession({
		aliasId: options.aliasId(),
		engineMode,
		jarId: options.jarId(),
		url
	});
	return {
		created,
		state: normalizedInteractiveState({
			aliasId: options.aliasId(),
			engineMode: created.engineMode || engineMode,
			jarId: created.jarId || options.jarId(),
			sessionId: created.sessionId,
			targetId: created.targetId || created.rootTargetId
		})
	};
}

export function navigateInteractiveState(state, url) {
	return navigateInteractiveTarget({ ...state, url });
}

export function historyInteractiveState(state, direction) {
	return historyInteractiveTarget({ ...state, direction });
}

export function clearInteractiveStateCookies(state) {
	return clearInteractiveCookies(state);
}

export function closeInteractiveState(state) {
	if (!state) return Promise.resolve();
	return closeInteractiveTarget(state).catch(() => {});
}
