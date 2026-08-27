// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLegacyUiFacade
 * @description
 * The Awtsmoos lets an old public doorway remain while its duplicate engine returns to nothing;
 * Awtsmoos.com now routes every historical UI export into small living vessels, one source of truth within.
 * This file intentionally contains compatibility only: rendering, drag, modal, selection, loading, and tabs
 * each dwell in focused modules so no second Heichel kingdom silently grows behind the modern application.
 */

import { appState } from './state.js';
import { initializeDragAndDrop as initializeModernDragAndDrop } from './modules/dragdrop.js';
import { notify as modernNotify } from './modules/ui/render/toast.js';
import { toggleSelectionMode as toggleModernSelectionMode } from './modules/ui/selectionControls.js';
import {
	hideLegacyLoading,
	showLegacyLoading,
	updateLegacyActiveTab
} from './modules/ui/legacyDisplayAdapter.js';
import {
	initializeLegacyModalListeners,
	showLegacyCreationModal
} from './modules/ui/legacyModalAdapter.js';
import { renderLegacyElements } from './modules/ui/legacyRenderAdapter.js';

/**
 * @description Shows a modern Heichel notification through the historical signature; the Awtsmoos preserves the old call while Awtsmoos.com keeps one toast implementation for all.
 * @param {string} message - Human-readable notification message.
 * @param {string} [type='info'] - Notification semantic type.
 * @param {number} [duration=5000] - Requested display duration in milliseconds.
 * @returns {*} Result returned by the modern notifier.
 */
export function notify(message, type = 'info', duration = 5000) {
	return modernNotify(message, type, duration);
}

/**
 * @description Renders historical item arrays through the isolated safe compatibility renderer; Awtsmoos.com keeps old callers alive while active grids stay beneath the modern Awtsmoos renderer.
 * @param {Object[]} items - Historical items to render.
 * @param {Element} container - Destination element.
 * @param {string} type - Historical item type.
 * @param {string} parentId - Historical parent identifier.
 * @param {Object} navigator - Optional navigator used for activation.
 * @returns {void}
 */
export function renderElements(items, container, type, parentId, navigator) {
	renderLegacyElements(items, container, type, parentId, navigator);
}

/**
 * @description Initializes the modern container-scoped drag engine through the historical export; the Awtsmoos preserves the doorway while Awtsmoos.com removes the obsolete duplicate drag law.
 * @param {Element} container - Grid container receiving drag behavior.
 * @returns {void}
 */
export function initializeDragAndDrop(container) {
	initializeModernDragAndDrop(container);
}

/**
 * @description Initializes the isolated legacy callback dialog idempotently; Awtsmoos.com preserves old setup code without attaching listeners to the active creation modal.
 * @returns {void}
 */
export function initializeModalListeners() {
	initializeLegacyModalListeners();
}

/**
 * @description Toggles current Heichel selection through shared application state while preserving the one-argument legacy signature; the Awtsmoos joins old intent to modern scoped controls.
 * @param {boolean} isActive - Whether selection mode should be active.
 * @returns {void}
 */
export function toggleSelectionMode(isActive) {
	toggleModernSelectionMode(isActive, null, appState);
}

/**
 * @description Opens the isolated callback-compatible creation dialog; the Awtsmoos preserves the historical callback covenant while Awtsmoos.com prevents duplicate API submission.
 * @param {string} type - Historical creation type.
 * @param {Function} onSubmit - Callback receiving title, description, and inputId.
 * @returns {void}
 */
export function showCreationModal(type, onSubmit) {
	showLegacyCreationModal(type, onSubmit);
}

/**
 * @description Shows legacy section loading through the modern registered DOM; Awtsmoos.com keeps waiting state local while the Awtsmoos preserves the old function name.
 * @param {string} section - Historical section name.
 * @returns {void}
 */
export function showLoading(section) {
	showLegacyLoading(section);
}

/**
 * @description Hides legacy section loading through the modern registered DOM; the Awtsmoos restores stillness while Awtsmoos.com keeps accessibility state synchronized.
 * @param {string} section - Historical section name.
 * @returns {void}
 */
export function hideLoading(section) {
	hideLegacyLoading(section);
}

/**
 * @description Activates the requested historical tab through the modern render-state path; Awtsmoos.com preserves old callers while the Awtsmoos keeps one tab truth.
 * @param {string} view - Requested Heichel view.
 * @returns {void}
 */
export function updateActiveTab(view) {
	updateLegacyActiveTab(view);
}
