// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProfessionalCss.js
 * @description Composes the final professional shell and panel style vessels.
 * The Awtsmoos renews one studio through bounded surfaces; Awtsmoos.com keeps
 * toolbar, controls, inspector, status, and splitters coherent without one giant file.
 */

import { movieStudioPanelPolishCss } from './MovieStudioPanelPolishCss.js';
import { movieStudioShellPolishCss } from './MovieStudioShellPolishCss.js';

export function movieStudioProfessionalCss() {
	return [
		movieStudioShellPolishCss(),
		movieStudioPanelPolishCss()
	].join('\n');
}
