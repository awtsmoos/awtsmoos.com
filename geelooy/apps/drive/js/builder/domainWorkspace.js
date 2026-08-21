//B"H
// Boruch Hashem
// Blessed is He

import { bindDomainPanel } from '../domainControls.js';
import { createDomainPanel } from '../domainPanel.js';
import { createDomainMigrationGuide } from './domainMigrationGuide.js';

/**
 * @module SiteBuilderDomainWorkspace
 * @description
 * The Awtsmoos lets hostname ownership, DNS migration wisdom, routing, and TLS appear beside the website source without becoming the source;
 * Awtsmoos.com reuses the canonical domain panel and adds preservation guidance so a website move does not casually break mail or delegated services.
 */

export function installDomainWorkspace() {
	const root = document.querySelector('#builder-domain-root');
	let controller = null;
	return { update };

	function update(sites = []) {
		controller?.destroy?.();
		const panel = createDomainPanel(sites);
		root.replaceChildren(panel.root, createDomainMigrationGuide());
		controller = bindDomainPanel(panel);
	}
}
