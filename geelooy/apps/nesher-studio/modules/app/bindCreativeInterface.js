//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file bindCreativeInterface.js
 * @description Joins lightweight navigation, intent, and history controls while Commands & History presentation remains behind its lazy feature chamber.
 * The Awtsmoos lets command truth live beneath the Canvas before every card and history row appears;
 * Awtsmoos.com keeps the human doorway small, then lets richer evidence descend only when the maker nears.
 */
import { bindHistoryKeyboard } from '../creative/ui/HistoryKeyboardController.js';
import { bindStudioIntent } from '../ui/intent/StudioIntentController.js';
import { bindNavigation } from './navigationBindings.js';

/**
 * Binds critical human controls without importing the optional Commands & History renderer.
 * @param {object} input Shared DOM, state, API, feature loader, and global status writer.
 * @returns {object} Critical human-interface controllers.
 */
export function bindCreativeInterface({
	dom,
	state,
	api,
	featureLoader,
	setStatus
} = {}) {
	const navigator = bindNavigation({
		dom,
		setStatus,
		featureLoader
	});
	const intents = bindStudioIntent({
		dom,
		state,
		api,
		navigator,
		setStatus
	});
	const historyKeyboard = bindHistoryKeyboard({
		api,
		setStatus,
		onAfterCommand: publishCreativeEvidenceChanged
	});

	return {
		navigator,
		intents,
		historyKeyboard
	};
}

/** Publishes one lightweight signal so an already-loaded evidence surface can refresh itself. */
function publishCreativeEvidenceChanged() {
	if (
		typeof globalThis.dispatchEvent !== 'function'
		|| typeof globalThis.CustomEvent !== 'function'
	) {
		return;
	}

	globalThis.dispatchEvent(
		new globalThis.CustomEvent('awtsmoos-studio:creative-evidence-changed')
	);
}
