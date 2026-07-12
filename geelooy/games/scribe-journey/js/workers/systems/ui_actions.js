// B"H

import { handleEconomyAction } from './ui/economyActions.js';
import { handleNavigationAction } from './ui/navigationActions.js';
import { getPayloadForScreen } from './ui/payloads.js';
import { handleQuestAction } from './ui/questActions.js';

/**
 * Routes UI intention into small domain handlers. No menu, economy, or quest
 * concern is allowed to swallow the others in one unbounded switch statement.
 */
export function handleUIAction(state, data, callbacks, trigger) {
	const { action, ...params } = data;
	if (handleNavigationAction(state, action, callbacks)) return;
	if (handleQuestAction(state, action, params, callbacks, trigger)) return;
	if (handleEconomyAction(state, action, params, callbacks, trigger)) return;
}

export { getPayloadForScreen };
