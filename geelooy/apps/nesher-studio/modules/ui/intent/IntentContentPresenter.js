//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file IntentContentPresenter.js
 * @description Chooses the truthful Create, Edit, Animate, or More sheet content from current capabilities and selection.
 * The Awtsmoos lets one intent reveal its fitting garment without teaching the controller every visual detail;
 * Awtsmoos.com keeps the sheet progressively disclosed, each action real, and every deeper doorway explicit and vital.
 */
import {
	animateIntentActions,
	createIntentActions,
	moreIntentGroups
} from './IntentContentModel.js';
import { renderEditIntent } from './EditIntentView.js';
import {
	renderIntentActions,
	renderIntentGroups
} from './IntentSheetRenderer.js';
import { currentStageSelection } from './SelectionContextPresenter.js';

/**
 * Renders the selected beginner intent using current live state and explicit dispatcher callbacks.
 * @param {object} input Intent identity, DOM, state, and dispatcher.
 */
export function presentStudioIntent(input = {}) {
	if (input.intent === 'create') {
		renderCreateIntent(input);
		return;
	}

	if (input.intent === 'edit') {
		renderEditIntent({
			dom: input.dom,
			source: currentStageSelection(input.state),
			onCommand: input.dispatcher.executeCommand.bind(input.dispatcher),
			onWorkstation: input.dispatcher.openWorkstation.bind(input.dispatcher)
		});
		return;
	}

	if (input.intent === 'animate') {
		renderAnimateIntent(input);
		return;
	}

	renderMoreIntent(input);
}

function renderCreateIntent(input) {
	renderIntentActions({
		dom: input.dom,
		eyebrow: 'Add something',
		title: 'Create',
		description: 'Start with real Studio capabilities. Deeper creation tools appear here only when their engines exist.',
		actions: createIntentActions(),
		onAction: input.dispatcher.dispatch.bind(input.dispatcher)
	});
}

function renderAnimateIntent(input) {
	renderIntentActions({
		dom: input.dom,
		eyebrow: 'Timing & motion',
		title: 'Animate',
		description: 'The current Studio has a real Timeline. Canonical keyframes and curves will join this sheet when the property-animation layer exists.',
		actions: animateIntentActions(),
		onAction: input.dispatcher.dispatch.bind(input.dispatcher)
	});
}

function renderMoreIntent(input) {
	renderIntentGroups({
		dom: input.dom,
		eyebrow: 'Go deeper',
		title: 'More',
		description: 'Open professional workspaces, project systems, and the shared Creative Language without leaving editable project truth.',
		groups: moreIntentGroups(),
		onAction: input.dispatcher.dispatch.bind(input.dispatcher)
	});
}
