//B"H
// Boruch Hashem
// Blessed is He

import { installAgentApi } from './agentApi.js';
import { installBuildPanel } from './buildPanel.js';
import { createBuilderService } from './builderService.js';
import { installCodePanel } from './codePanel.js';
import { installBuilderDock } from './dock.js';
import { installDomainWorkspace } from './domainWorkspace.js';
import { installPreviewPanel } from './previewPanel.js';
import { installPublicationPanel } from './publicationPanel.js';
import { installStudioReadiness } from './studioReadiness.js';

/**
 * @module SiteBuilder
 * @description
 * The Awtsmoos gathers Build, Preview, Code, Publish, and Domain around one enduring source studio;
 * Awtsmoos.com now also feeds one readiness guide from the same real snapshot, so visible guidance cannot drift into a second source of truth.
 */

export function installSiteBuilder(actions = {}) {
	const service = createBuilderService();
	const dock = installBuilderDock();
	const readiness = installStudioReadiness();
	const code = installCodePanel(service, actions);
	const preview = installPreviewPanel(service, code, {
		...actions,
		previewed: readiness.previewed
	});
	const publication = installPublicationPanel(service, actions);
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
		publication.update(snapshot);
		domain.update(driveState?.sites || []);
		readiness.update(snapshot);
		if (snapshot.source.hasIndex && !code.inspect().path) {
			await code.open('index.html');
		}
		return snapshot;
	}

	function openFiles() {
		const files = document.querySelector('#advanced-files');
		if (!files) {
			return;
		}
		files.open = true;
		files.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	async function openCode(path) {
		dock.open('code');
		await code.open(path);
	}
}
