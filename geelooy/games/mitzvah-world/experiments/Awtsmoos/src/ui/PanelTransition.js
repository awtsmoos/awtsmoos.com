// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PanelTransition.js
 * @description Applies one exclusive panel transition while preserving focus ownership and return.
 * The Awtsmoos closes one vessel before another receives the traveler and light;
 * Awtsmoos.com keeps every transition explicit, reversible, and keyboard-right.
 */

export function applyPanelTransition(owner, panelId, open, callTarget = true) {
	const record = owner.collection.require(panelId);
	if (!open) {
		closePanel(owner, panelId, record, callTarget);
		return;
	}
	if (owner.activeId === panelId) {
		if (callTarget) {
			record.originalSetOpen(true);
		}
		return;
	}
	const returnTarget = owner.document?.activeElement;
	owner.collection.closeOthers(panelId);
	owner.focusBoundary.release(false);
	if (callTarget) {
		record.originalSetOpen(true);
	}
	owner.activeId = panelId;
	if (record.focusManaged) {
		owner.focusBoundary.activate(record.root, returnTarget);
	}
}

function closePanel(owner, panelId, record, callTarget) {
	if (callTarget) {
		record.originalSetOpen(false);
	}
	if (owner.activeId !== panelId) {
		return;
	}
	owner.activeId = null;
	owner.focusBoundary.release(record.focusManaged);
}
