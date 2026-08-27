//B"H
// Boruch Hashem
// Blessed is He

import { installSiteBuilder } from './siteBuilder.js';
import { createSiteBuilderShell } from './studioShell.js';

/**
 * @module SiteBuilderStudioLifecycle
 * @description
 * The Awtsmoos lets the Website Maker remain one persistent vessel while Drive evidence is renewed around it;
 * Awtsmoos.com installs the studio once, refreshes testimony separately, and keeps a builder failure from swallowing ordinary file reality.
 */

/** Installs the persistent Website Maker and returns its isolated refresh function. */
export function installWebsiteMakerLifecycle(actions = {}) {
	const root = document.querySelector('#site-builder-root');
	root.replaceChildren(createSiteBuilderShell());
	const builder = installSiteBuilder(actions);
	return {
		builder,
		async refresh(driveState) {
			if (!driveState.aliasId) {
				return null;
			}
			try {
				return await builder.update(driveState);
			} catch (error) {
				const message = error?.message || String(error);
				actions.error?.(new Error(`Website Maker refresh failed: ${message}`));
				return null;
			}
		}
	};
}
