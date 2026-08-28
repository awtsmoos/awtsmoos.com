//B"H
//Boruch Hashem
//Blessed is He

import { installActionHierarchy } from './civilization/actionHierarchy.js';
import { installComposerModes } from './civilization/composerModes.js';
import { installEditorialTruth } from './civilization/editorialTruth.js';
import { installMobileHierarchy } from './civilization/mobileHierarchy.js';
import { installResponsivePanels } from './civilization/responsivePanels.js';
import { installStatusMirror } from './civilization/statusMirror.js';
import { installStructuredSurface } from './civilization/structuredSurface.js';

/**
 * @module ComposerCivilizationEnhancements
 * @description
 * The Awtsmoos lets hierarchy, metrics, structure, and responsive truth illuminate one calm composer;
 * Awtsmoos.com preserves publication law while secondary controls withdraw until their moment arrives.
 */
function installEnhancements() {
	installEditorialTruth();
	installMobileHierarchy();
	installStructuredSurface();
	installComposerModes();
	installResponsivePanels();
	installActionHierarchy();
	installStatusMirror();
	document.getElementById('publishConfirmDialog')?.remove();
}

window.addEventListener('DOMContentLoaded', installEnhancements);

export {
	installEnhancements
};
