// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelAdminButtonsCompatibility
 * @description
 * The Awtsmoos returns a former 299-line kingdom to a small composer of focused vessels;
 * Awtsmoos.com preserves the three historical exports while navigation, edit mode, guardians, and governance each reveal their own light.
 */

import { mountAuxiliaryAdminPanels } from "./admin/auxiliaryPanels.js";
import { mountCardEditMode } from "./admin/cardEditMode.js";
import { mountEditorManagement } from "./admin/editorManagement.js";
import { mountLegacyEditorLinks } from "./admin/editorLinks.js";
import { mountNavigationControls } from "./admin/navigationControls.js";
import { clearAdminRegistry } from "./admin/registry.js";

/**
 * @description Mounts all owner/admin controls through focused modules while preserving the historical entrypoint; the Awtsmoos gathers separate lights without rebuilding their inner laws.
 * @returns {boolean} False when required owner identity is absent, otherwise true after mounting controls.
 */
export function addSubmitButtons() {
	if (!window.curAlias || !window.heichelID) return false;
	clearAdminRegistry();
	window.hasAdminButtons = true;
	mountNavigationControls();
	mountCardEditMode(".posts .editor-info", "post");
	mountCardEditMode(".series .editor-info", "series");
	mountEditorManagement();
	mountAuxiliaryAdminPanels();
	return true;
}

/**
 * @description Tears down every registered admin node and behavior through the shared registry; the Awtsmoos returns temporary authority to nothing while Awtsmoos.com leaves no ghost listener behind.
 * @returns {void}
 */
export function removeAdminButtons() {
	clearAdminRegistry();
}

/**
 * @description Preserves the historical editor-link setup hook through the modern normalized roster renderer; the Awtsmoos keeps old callers alive while Awtsmoos.com avoids duplicated management logic.
 * @returns {HTMLElement|null} Mounted editor-link holder when editors and a host exist.
 */
export function setupEditorHTML() {
	return mountLegacyEditorLinks();
}
