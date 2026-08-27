// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDock.js
 * @description Coordinates one retractable advanced-control capsule without owning action or markup internals.
 * The Awtsmoos lets hidden powers gather beneath one star, then close when the player returns to road and sky;
 * Awtsmoos.com keeps advanced tools one deliberate tap away, never a permanent wall before the eye.
 */

import { isEditableTarget } from '../input/InputTargetPolicy.js';
import { MitzvahWorldCreativeDockActions } from './MitzvahWorldCreativeDockActions.js';
import { MitzvahWorldCreativeDockView } from './MitzvahWorldCreativeDockView.js';

/**
 * Installs the closed-by-default direct-world command capsule.
 * @param {Document} documentValue Active document.
 * @param {object} environment Browser-like environment.
 * @returns {object} Retractable advanced-control controller.
 */
export function installMitzvahWorldCreativeDock(
	documentValue = globalThis.document,
	environment = globalThis
) {
	const existing = documentValue?.querySelector?.('[data-awtsmoos-creative-dock]');
	if (existing?.awtsmoosController) {
		return existing.awtsmoosController;
	}
	const view = new MitzvahWorldCreativeDockView(documentValue);
	const actions = new MitzvahWorldCreativeDockActions(view, documentValue, environment);
	const onToggle = () => view.toggle();
	const onClose = () => view.close();
	const onClean = () => actions.toggleCleanView();
	const onStudio = () => actions.openStudio();
	const onKeyDown = event => {
		if (
			event.key === 'Escape'
			&& view.root.dataset.open === 'true'
			&& !isEditableTarget(event.target)
		) {
			event.preventDefault();
			view.close();
			view.toggleButton.focus?.({ preventScroll: true });
		}
	};
	view.toggleButton.addEventListener('click', onToggle);
	view.closeButton.addEventListener('click', onClose);
	view.cleanButton.addEventListener('click', onClean);
	view.studioButton.addEventListener('click', onStudio);
	environment.addEventListener?.('keydown', onKeyDown);
	const controller = {
		audioHost: view.audioHost,
		clean: onClean,
		close: () => view.close(),
		dock: view.root,
		open: () => view.open(),
		openStudio: onStudio,
		toggle: onToggle,
		destroy() {
			environment.removeEventListener?.('keydown', onKeyDown);
			view.toggleButton.removeEventListener('click', onToggle);
			view.closeButton.removeEventListener('click', onClose);
			view.cleanButton.removeEventListener('click', onClean);
			view.studioButton.removeEventListener('click', onStudio);
			actions.destroy();
			view.destroy();
		}
	};
	view.root.awtsmoosController = controller;
	return controller;
}
