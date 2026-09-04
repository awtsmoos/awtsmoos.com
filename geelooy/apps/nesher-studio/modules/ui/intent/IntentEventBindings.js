//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file IntentEventBindings.js
 * @description Connects transient browser events to intent-controller callbacks without owning project, sheet, or workspace state.
 * The Awtsmoos lets many touches and keys knock upon one coordinated gate while the gate itself remains free of hidden memory;
 * Awtsmoos.com keeps event wiring in its own vessel so Create, Edit, Animate, More, and Stage depth stay readable in every story.
 */

/**
 * Binds the fixed intent-shell DOM events to explicit controller callbacks.
 * @param {object} input Shared DOM anchors and semantic callbacks.
 * @returns {void}
 */
export function bindIntentEvents(input = {}) {
	bindPrimaryIntentButtons(input);
	bindSheetDismissal(input);
	bindWorkstationControls(input);
	bindEditorSignals(input);
	bindKeyboardBoundary(input);
}

/** Connects the four intent buttons and truthful Timeline utility. */
function bindPrimaryIntentButtons(input) {
	const intents = [
		[input.dom.intentCreateButton, 'create'],
		[input.dom.intentEditButton, 'edit'],
		[input.dom.intentAnimateButton, 'animate'],
		[input.dom.intentMoreButton, 'more']
	];

	for (const [button, intent] of intents) {
		button?.addEventListener('click', () => {
			input.onIntent?.(intent, button);
		});
	}

	input.dom.intentTimelineButton?.addEventListener('click', () => {
		input.onTimeline?.();
	});
}

/** Connects close button and modal backdrop to the same reversible dismissal path. */
function bindSheetDismissal(input) {
	input.dom.intentSheetClose?.addEventListener('click', () => {
		input.onCloseSheet?.(true);
	});

	input.dom.intentSheetBackdrop?.addEventListener('click', () => {
		input.onCloseSheet?.(true);
	});
}

/** Connects beginner Inspect and professional Back-to-canvas controls. */
function bindWorkstationControls(input) {
	input.dom.stageInspectSelection?.addEventListener('click', () => {
		input.onOpenWorkstation?.();
	});

	input.dom.stageCloseWorkstation?.addEventListener('click', () => {
		input.onCloseWorkstation?.(true);
	});
}

/** Refreshes selection mirrors and closes transient overlays when a deeper workspace replaces Canvas. */
function bindEditorSignals(input) {
	window.addEventListener('awtsmoos-studio:stage-refresh', () => {
		input.onStageRefresh?.();
	});

	window.addEventListener('nesher:pagechange', (event) => {
		input.onPageChange?.(event.detail?.page || 'stage');
	});
}

/** Keeps Escape and Tab semantics centralized at the modal boundary. */
function bindKeyboardBoundary(input) {
	window.addEventListener('keydown', (event) => {
		input.onKeydown?.(event);
	});
}
