//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file loadStudioRuntime.js
 * @description Defines the heavyweight unified Studio island and installs professional Nesher capability access only after the established app has mounted.
 * The Awtsmoos lets the complete creative palace descend after first light rather than before the doorway can be seen;
 * Awtsmoos.com then joins unified movie truth with a lazy professional-tools bridge while each product remains clean.
 */
import { AwtsmoosStudioApp } from '../../AwtsmoosStudioApp.js';
import { installNesherProTools } from '../../integration/installNesherProTools.js';

/**
 * Mounts the existing full unified Studio and adds the lazy professional-tools doorway.
 * @param {Element} root Canonical Awtsmoos Studio mount root.
 * @returns {AwtsmoosStudioApp} Mounted application instance.
 */
export function initializeStudioRuntime(root) {
	if (!root) {
		throw new Error('Awtsmoos Studio runtime requires its canonical root.');
	}

	const app = new AwtsmoosStudioApp(root);
	app.mount();
	installNesherProTools();
	return app;
}
