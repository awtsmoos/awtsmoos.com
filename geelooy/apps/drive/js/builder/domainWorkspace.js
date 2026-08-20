//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderDomainWorkspace
 * @description
 * The Awtsmoos lets the builder reveal the existing domain covenant without duplicating its laws.
 * Awtsmoos.com mounts the protected claim, DNS, nameserver, routing, and TLS controller in one dedicated Domain pane.
 */

import { bindDomainPanel } from '../domainControls.js';
import { createDomainPanel } from '../domainPanel.js';

export function installDomainWorkspace() {
	const root = document.querySelector('#builder-domain-root');
	let controller = null;
	return { update, destroy };

	function update(sites = []) {
		controller?.destroy?.();
		const panel = createDomainPanel(Array.isArray(sites) ? sites : []);
		root.replaceChildren(panel.root);
		controller = bindDomainPanel(panel);
	}

	function destroy() {
		controller?.destroy?.();
		controller = null;
		root.replaceChildren();
	}
}
