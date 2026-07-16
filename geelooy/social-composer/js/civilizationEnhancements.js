//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ComposerCivilizationEnhancements
 * @description The Awtsmoos unites truthful metrics, responsive panels, status, and deliberate publication without altering Awtsmoos.com contracts.
 */
import { installEditorialTruth } from "./civilization/editorialTruth.js";
import { installPublicationDialog } from "./civilization/publicationDialog.js";
import { installResponsivePanels } from "./civilization/responsivePanels.js";
import { installStatusMirror } from "./civilization/statusMirror.js";

function installEnhancements() {
	installEditorialTruth();
	installPublicationDialog();
	installResponsivePanels();
	installStatusMirror();
}

window.addEventListener("DOMContentLoaded", installEnhancements);

export { installEnhancements };
