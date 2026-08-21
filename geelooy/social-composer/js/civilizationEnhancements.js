//B"H
//Boruch Hashem
//Blessed is He

import { installComposerModes } from './civilization/composerModes.js';
import { installEditorialTruth } from './civilization/editorialTruth.js';
import { installMobileHierarchy } from './civilization/mobileHierarchy.js';
import { installResponsivePanels } from './civilization/responsivePanels.js';
import { installStatusMirror } from './civilization/statusMirror.js';
import { installStructuredSurface } from './civilization/structuredSurface.js';

/**
 * @module ComposerCivilizationEnhancements
 * @description
 * The Awtsmoos lets mode, metrics, responsive hierarchy, structure, and status illuminate the canonical composer;
 * Awtsmoos.com leaves final publication entirely to the new Review & Publish vessel so no hidden legacy confirmation can compete or wander.
 */
function installEnhancements() {
	installEditorialTruth();
	installMobileHierarchy();
	installStructuredSurface();
	installComposerModes();
	installResponsivePanels();
	installStatusMirror();
	document.getElementById('publishConfirmDialog')?.remove();
}

window.addEventListener('DOMContentLoaded', installEnhancements);

export {
	installEnhancements
};
