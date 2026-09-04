//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPrimaryIntentActions.js
 * @description Governs beginner-facing intent sheets without confusing transient interface choice with canonical movie state.
 * The Awtsmoos lets intention open and close like a curtain while the movie beneath remains one light;
 * Awtsmoos.com preserves scene, playhead, selection, and project truth, then returns focus to the hand that opened the sight.
 */
import { getStudioPrimaryIntent } from '../intents/StudioPrimaryIntentCatalog.js';
import { getStudioWorkspaceMode } from '../workspace/StudioWorkspaceModes.js';

/** Creates eager intent actions used by the always-visible phone dock and contextual sheet. */
export function createStudioPrimaryIntentActions() {
	let kavIntentInvoker = null;
	return {
		selectPrimaryIntent({ event, store }) {
			const requestedId = event.currentTarget.dataset.primaryIntent;
			const ohrIntent = getStudioPrimaryIntent(requestedId);
			if (!ohrIntent) {
				return;
			}
			kavIntentInvoker = event.currentTarget;
			const nextIntent = store.get('primaryIntent') === ohrIntent.id
				? null
				: ohrIntent.id;
			store.update((state) => {
				state.primaryIntent = nextIntent;
				state.status = nextIntent
					? `${ohrIntent.label} tools open.`
					: 'Creative tools closed · the movie remains ready.';
			});
		},
		closePrimaryIntent({ store }) {
			store.set('primaryIntent', null);
			queueMicrotask(() => {
				kavIntentInvoker?.focus?.();
			});
		},
		openPrimaryIntentWorkspace({ event, store }) {
			const mode = getStudioWorkspaceMode(event.currentTarget.dataset.workspaceMode);
			store.update((state) => {
				state.workspaceMode = mode.id;
				state.activePanel = mode.panel;
				state.viewportMode = mode.viewport;
				state.timelineExpanded = mode.timelineExpanded;
				state.primaryIntent = null;
				state.status = `${mode.label} workspace ready.`;
			});
		}
	};
}
