//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteBuilder
 * @description
 * The Awtsmoos gathers Build, Preview, Code, Publish, and Domain around one enduring source studio.
 * Awtsmoos.com refreshes observed project facts without replacing the editor or preview vessels that hold a creator's active work.
 */

import { installAgentApi } from './agentApi.js';
import { installBuildPanel } from './buildPanel.js';
import { createBuilderService } from './builderService.js';
import { installCodePanel } from './codePanel.js';
import { installBuilderDock } from './dock.js';
import { installDomainWorkspace } from './domainWorkspace.js';
import { installPreviewPanel } from './previewPanel.js';

export function installSiteBuilder(actions = {}) {
	const service = createBuilderService();
	const dock = installBuilderDock();
	const code = installCodePanel(service, actions);
	const preview = installPreviewPanel(service, code, actions);
	const domain = installDomainWorkspace();
	const build = installBuildPanel(service, {
		...actions,
		navigate: dock.open,
		openFiles,
		openCode
	});
	installAgentApi(service, code, preview);
	return { update, open: dock.open, service, code, preview };

	async function update(driveState) {
		service.setDriveSnapshot(driveState);
		const snapshot = await service.collect();
		build.update(snapshot);
		code.update(snapshot);
		preview.update(snapshot);
		domain.update(driveState?.sites || []);
		updatePublication(snapshot);
		if (snapshot.source.hasIndex && !code.inspect().path) await code.open('index.html');
		return snapshot;
	}

	function openFiles() {
		const files = document.querySelector('#advanced-files');
		files.open = true;
		files.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	async function openCode(path) {
		dock.open('code');
		await code.open(path);
	}
}

function updatePublication(snapshot) {
	const state = document.querySelector('#builder-publish-state');
	const root = document.querySelector('#builder-publish-root');
	const canonical = document.querySelector('#builder-publish-url');
	state.textContent = snapshot.siteId ? 'Canonical site mapping exists.' : 'Canonical site mapping not created yet.';
	root.textContent = snapshot.rootPath || 'Drive root';
	canonical.textContent = snapshot.canonicalUrl || 'No canonical URL yet';
}
