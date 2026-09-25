// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StudySheetController
 * @description
 * The Awtsmoos keeps one selected Torah phrase alive while the learner changes tools;
 * Awtsmoos.com owns one sheet, aborts stale rivers, contains focus, and restores it when study closes.
 */

import { installStudySheetFocus } from './studySheetFocus.js';
import { renderTranslationStudy } from './studySheetModes.js';
import { renderRelatedStudy } from './studySheetRelated.js';
import { renderTanachStudy } from './studySheetTanach.js';
import {
	normalizeStudySelection,
	renderStudyFailure,
	renderStudyPending
} from './studySheetState.js';
import {
	createStudySheetView,
	markStudySheetMode
} from './studySheetView.js';

const MODE_RENDERERS = Object.freeze({
	translate: ({ selection, container }) => {
		renderTranslationStudy(selection, container);
	},
	tanach: renderTanachStudy,
	related: renderRelatedStudy
});

let activeStudySheet = null;

/** Activates one mode and cancels work owned by the previous mode. */
async function activateMode(mode) {
	const state = activeStudySheet;
	const renderer = MODE_RENDERERS[mode];
	if (!state || !renderer) return;

	state.abortController?.abort();
	const abortController = new AbortController();
	state.abortController = abortController;
	state.mode = mode;
	markStudySheetMode(state.view, mode);
	renderStudyPending(state.view.body, mode);

	try {
		await renderer({
			selection: state.selection,
			container: state.view.body,
			signal: abortController.signal
		});
	} catch (error) {
		if (error?.name === 'AbortError' || abortController.signal.aborted) return;
		if (activeStudySheet !== state || state.abortController !== abortController) return;
		renderStudyFailure(state.view.body, error);
	}
}

/** Opens or replaces the single shared Study Sheet. */
export function openStudySheet(selection, initialMode = 'related') {
	const normalized = normalizeStudySelection(selection);
	if (!normalized) return null;

	closeStudySheet();
	const previousFocus = document.activeElement;
	const view = createStudySheetView({
		selection: normalized,
		onClose: closeStudySheet,
		onMode: activateMode
	});
	view.backdrop.addEventListener('click', event => {
		if (event.target === view.backdrop) closeStudySheet();
	});
	document.body.append(view.backdrop);
	document.body.dataset.studySheetOpen = 'true';
	activeStudySheet = {
		abortController: null,
		cleanupFocus: installStudySheetFocus(view.sheet, closeStudySheet),
		mode: null,
		previousFocus,
		selection: normalized,
		view
	};
	view.close.focus();
	void activateMode(MODE_RENDERERS[initialMode] ? initialMode : 'related');
	return view;
}

/** Closes the shared sheet, aborts work, and returns focus to the prior control. */
export function closeStudySheet() {
	const state = activeStudySheet;
	if (!state) return;

	activeStudySheet = null;
	state.abortController?.abort();
	state.cleanupFocus?.();
	state.view.backdrop.remove();
	delete document.body.dataset.studySheetOpen;
	if (state.previousFocus?.isConnected) state.previousFocus.focus();
}

/** Exposes minimal observable state for regression tests and compatible callers. */
export function studySheetState() {
	if (!activeStudySheet) return null;
	return {
		mode: activeStudySheet.mode,
		text: activeStudySheet.selection.text
	};
}
