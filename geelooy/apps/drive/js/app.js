//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveApp
 * @description
 * The Awtsmoos coordinates identity, files, sites, durable project intent, and server-backed Project Testimony as one visible world;
 * Awtsmoos.com refreshes file truth, publication truth, creator intent, and capability evidence together so no surface drifts from another.
 */

import { getProjectPlan, getSiteStatus, getUsage, listEntries, listSites } from './api.js';
import { copyPublicLink, routeEntryAction } from './actions.js';
import { installConnectionControls } from './connectionControls.js';
import { installControls } from './controlBindings.js';
import { installDialogFocusReturn } from './dialogs.js';
import { applyEmbeddedMode } from './embed.js';
import { installForms } from './formBindings.js';
import { renderProjectPlatform } from './projectPlatform.js';
import { publicUrl, renderEntries, renderPagination, renderUsage, showError, showStatus } from './render.js';
import { installSiteControls, renderSiteStatus } from './siteControls.js';
import { driveState, setEntries, setSite, setSites, updateFilters } from './state.js';
import { uploadFiles } from './uploads.js';

async function refresh() {
	try {
		showStatus('Loading Drive, publications, durable intent, and Project Testimony…');
		const [entries, usage, siteResult, sitesResult, projectResult] = await Promise.all([
			listEntries(),
			getUsage(),
			getSiteStatus(),
			listSites(),
			getProjectPlan()
		]);
		setEntries(entries);
		setSite(siteResult.site);
		setSites(sitesResult);
		renderEntries(driveState.entries, handleEntryAction);
		renderUsage(usage);
		renderSiteStatus(driveState.site, driveState.sites);
		renderProjectPlatform(driveState, projectResult.project, refresh);
		renderPagination(driveState.page, driveState.page > 1, Boolean(driveState.nextCursor));
		showStatus(`Loaded ${driveState.entries.length} entries · ${driveState.sites.length} sites · Project Testimony v${projectResult.project.version}.`);
	} catch (error) {
		showError(error);
	}
}

async function handleEntryAction(action, entry) {
	try {
		if (action === 'link') {
			await copyPublicLink(entry.path);
			showStatus(`Copied ${publicUrl(entry.path)}`);
			return;
		}
		const handled = routeEntryAction(action, entry, openDirectory);
		if (!handled && entry.type === 'file') window.open(publicUrl(entry.path), '_blank', 'noopener');
	} catch (error) {
		showError(error);
	}
}

function openDirectory(path) {
	driveState.currentPath = path;
	document.querySelector('#current-path').value = path;
	updateFilters({});
	refresh();
}

async function handleUploads(files) {
	const progressElement = document.querySelector('#upload-progress');
	showStatus(`Streaming ${files.length} file(s)…`);
	const result = await uploadFiles(files, driveState.currentPath, progress => {
		progressElement.value = progress.totalBytes ? (progress.transferredBytes / progress.totalBytes) * 100 : 100;
		showStatus(`${progress.uploaded}/${progress.total} uploaded · ${progress.path}`);
	});
	if (result.failed.length) showError(new Error(`${result.failed.length} upload(s) failed.`));
	await refresh();
}

applyEmbeddedMode();
installDialogFocusReturn();
installConnectionControls();
installSiteControls(refresh, showError, showStatus);
installForms(refresh, showError);
installControls(refresh, handleUploads, openDirectory);
renderSiteStatus(null, []);
renderProjectPlatform(driveState, null, refresh);
showStatus('Enter an alias. Your current Awtsmoos session is selected by default.');
