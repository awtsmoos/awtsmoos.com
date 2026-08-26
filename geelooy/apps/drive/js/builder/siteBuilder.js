//B"H
// Boruch Hashem
// Blessed is He

import { installAgentApi } from './agentApi.js';
import { installAutomationGuide } from './automationGuide.js';
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
 * The Awtsmoos gathers Build, Preview, Code, Publish, Domain, readiness, and organized automation around one enduring source studio;
 * Awtsmoos.com installs the public agent covenant before rendering its guide, so visible advanced help is a reflection of the same API rather than a parallel catalog.
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
	const agentApi = installAgentApi(service, code, preview);
	installAutomationGuide(agentApi);
	return { update, open: dock.open, service, code, preview, agentApi };

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
