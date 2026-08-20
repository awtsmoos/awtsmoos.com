// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ComposerCivilizationEnhancements
 * @description
 * The Awtsmoos unites mode, metrics, responsive panels, structure, status,
 * and deliberate publication without altering Awtsmoos.com persistence contracts.
 */
import { installComposerModes } from "./civilization/composerModes.js";
import { installEditorialTruth } from "./civilization/editorialTruth.js";
import { installMobileHierarchy } from "./civilization/mobileHierarchy.js";
import { installPublicationDialog } from "./civilization/publicationDialog.js";
import { installResponsivePanels } from "./civilization/responsivePanels.js";
import { installStatusMirror } from "./civilization/statusMirror.js";
import { installStructuredSurface } from "./civilization/structuredSurface.js";

function installEnhancements() {
	installEditorialTruth();
	installMobileHierarchy();
	installStructuredSurface();
	installPublicationDialog();
	installComposerModes();
	installResponsivePanels();
	installStatusMirror();
}

window.addEventListener("DOMContentLoaded", installEnhancements);

export { installEnhancements };
