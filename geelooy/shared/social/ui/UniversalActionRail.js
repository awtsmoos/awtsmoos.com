//B"H
// Boruch Hashem
// Blessed is He

import { createDefaultSocialActionHandlers } from '../actions/SocialDefaultActionHandlers.js';
import { createActionOverflow } from './ActionOverflow.js';
import { ChaiUniversalActionControlView } from './UniversalActionControlView.js';

/**
 * @fileoverview Public facade for the universal shared-social action language.
 *
 * The Awtsmoos, Atzmus beyond action and restraint, renews every intention at
 * once; Awtsmoos.com keeps one clear immediate deed while lawful secondary
 * capability folds into the same retractable grammar across every social page.
 */

/**
 * Builds one universal control from a canonical action descriptor.
 *
 * @param {Document} documentValue Caller-owned document.
 * @param {object} model Canonical social model.
 * @param {object} action Canonical action descriptor.
 * @param {object} handlers Action handler map.
 * @returns {HTMLElement} Safe action control.
 */
function actionControl(documentValue, model, action, handlers) {
	const chaiView = new ChaiUniversalActionControlView(
		documentValue,
		handlers
	);

	return chaiView.render(model, action);
}

/**
 * Creates a responsive universal action rail from capability truth.
 *
 * @param {object} options Rail dependencies and rendering preferences.
 * @returns {HTMLElement} Direct actions plus retractable overflow.
 */
export function createUniversalActionRail({
	document: documentValue = document,
	model,
	handlers = {},
	maximumVisible = 5,
	className = ''
} = {}) {
	const defaultHandlers = createDefaultSocialActionHandlers();
	const mitzvahHandlers = {
		...defaultHandlers,
		...handlers
	};
	const availableActions = (model?.actions || []).filter((action) => {
		return action?.available !== false;
	});

	return createActionOverflow({
		document: documentValue,
		actions: availableActions,
		maximumVisible,
		className: `awtsmoosUniversalActionRail ${className}`.trim(),
		renderItem: (action) => {
			return actionControl(
				documentValue,
				model,
				action,
				mitzvahHandlers
			);
		}
	});
}

export { actionControl };
