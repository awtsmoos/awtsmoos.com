//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EditIntentView.js
 * @description Renders the curated selected-source Edit sheet from the same stable Stage command identities registered for every operator.
 * The Awtsmoos lets one chosen source reveal only the measures needed now, while deeper geometry waits below;
 * Awtsmoos.com keeps quick human actions joined to canonical names so simplicity and professional truth together flow.
 */
import { STAGE_COMMAND_IDS } from '../../creative/catalog/StageCommandIds.js';
import {
	createAspectIntentForm,
	createScaleIntentForm
} from './EditIntentForms.js';

/** Renders Edit intent content from the current live selected source. */
export function renderEditIntent(input = {}) {
	setSheetHeading(input.dom);
	const fragment = document.createDocumentFragment();

	if (!input.source) {
		fragment.append(
			createEmptySelectionMessage(),
			createWorkstationButton(input.onWorkstation)
		);
		input.dom.intentSheetBody.replaceChildren(fragment);
		return;
	}

	fragment.append(
		createSelectionSummary(input.source),
		createQuickActions(input.onCommand),
		createScaleIntentForm(input.source, input.onCommand),
		createAspectIntentForm(input.source, input.onCommand),
		createWorkstationButton(input.onWorkstation)
	);
	input.dom.intentSheetBody.replaceChildren(fragment);
}

/** Sets the shared sheet heading for selection-aware editing. */
function setSheetHeading(dom) {
	dom.intentSheetEyebrow.textContent = 'Selected object';
	dom.intentSheetTitle.textContent = 'Edit';
}

/** Builds a truthful empty-selection explanation instead of irrelevant disabled controls. */
function createEmptySelectionMessage() {
	const message = document.createElement('p');
	message.className = 'intent-sheet-description';
	message.textContent = 'Nothing is selected. Tap a layer on the canvas or open the Stage Workstation.';
	return message;
}

/** Creates the compact identity and geometry summary for the current selected source. */
function createSelectionSummary(source) {
	const card = document.createElement('div');
	const name = document.createElement('strong');
	const meta = document.createElement('span');

	card.className = 'intent-selection-card';
	name.textContent = source.name
		|| source.kind
		|| source.id
		|| 'Selected source';
	meta.textContent = sourceSummary(source);
	card.append(name, meta);
	return card;
}

/** Creates command-backed Center and Reset quick actions. */
function createQuickActions(onCommand) {
	const grid = document.createElement('div');
	grid.className = 'intent-edit-quick-grid';
	grid.append(
		commandButton('Center', STAGE_COMMAND_IDS.CENTER, onCommand),
		commandButton('Reset', STAGE_COMMAND_IDS.RESET_TRANSFORM, onCommand)
	);
	return grid;
}

/** Creates one stable-command button without embedding project mutation in the view. */
function commandButton(label, commandId, onCommand) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	button.addEventListener('click', async () => {
		await onCommand?.(commandId, {});
	});
	return button;
}

/** Creates the deliberate transition from simple Edit into the full professional Stage inspector. */
function createWorkstationButton(onWorkstation) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'intent-go-deeper';
	button.textContent = 'Go deeper · Stage Workstation';
	button.addEventListener('click', () => {
		onWorkstation?.();
	});
	return button;
}

/** Returns a concise live geometry phrase for the selected-source card. */
function sourceSummary(source) {
	const width = Math.round(Number(source.w || 0));
	const height = Math.round(Number(source.h || 0));
	const scale = Number(source.scalePercent || 100);
	return `${source.kind || 'Source'} · ${width}×${height} · ${scale}%`;
}
