//B"H
// Boruch Hashem
// Blessed is He

import { deleteSite, saveSite, siteUrl } from './api.js';
import { renderProjectWorkspace } from './projectWorkspace.js';
import { driveState, setUploadOptions } from './state.js';

/**
 * @module DriveSiteControls
 * @description
 * The Awtsmoos lets a folder become a named site through explicit scoped mutation;
 * Awtsmoos.com keeps upload intent, publication state, copying, opening, and deletion visible to the human.
 */

export function installSiteControls(refresh, showError, showStatus) {
	installUploadMode();
	document.querySelector('#open-site').addEventListener('click', () => openSite(driveState.site));
	document.querySelector('#copy-site').addEventListener('click', () => copySite(driveState.site));
	const workspace = document.querySelector('#project-workspace');
	workspace.addEventListener('submit', event => publishFolder(event, refresh, showError, showStatus));
	workspace.addEventListener('click', event => projectAction(event, refresh, showError, showStatus));
}

export function renderSiteStatus(site, sites = driveState.sites) {
	const badge = document.querySelector('#site-status-badge');
	const input = document.querySelector('#site-url');
	const summary = document.querySelector('#site-summary');
	const ready = Boolean(site?.ready);
	badge.textContent = ready ? 'Live' : 'Needs public index.html';
	badge.dataset.state = ready ? 'live' : 'draft';
	input.value = driveState.aliasId ? siteUrl(site) : 'Connect an alias to reveal its URL';
	summary.textContent = site
		? `${site.publicFileCount} public files · ${formatBytes(site.publicBytes)}`
		: 'A public index.html activates the primary site.';
	renderProjectWorkspace(site, sites, driveState.currentPath);
}

function installUploadMode() {
	const visibility = document.querySelector('#upload-visibility');
	const cachePolicy = document.querySelector('#upload-cache');
	const update = () => setUploadOptions({
		visibility: visibility.value,
		cachePolicy: cachePolicy.value
	});
	visibility.addEventListener('change', update);
	cachePolicy.addEventListener('change', update);
	document.querySelector('#website-mode').addEventListener('click', () => {
		visibility.value = 'public';
		cachePolicy.value = 'mutable';
		update();
		visibility.focus();
	});
	update();
}

async function publishFolder(event, refresh, showError, showStatus) {
	if (event.target.id !== 'project-publisher') return;
	event.preventDefault();
	try {
		const form = event.target;
		const data = new FormData(form);
		await saveSite(data.get('siteId'), {
			title: data.get('title'),
			rootPath: data.get('rootPath'),
			enabled: true,
			primary: form.elements.primary.checked,
			subdomainRequested: form.elements.subdomainRequested.checked
		});
		showStatus(`Published ${data.get('rootPath') || 'root'} as ${data.get('siteId')}.`);
		await refresh();
	} catch (error) {
		showError(error);
	}
}

async function projectAction(event, refresh, showError, showStatus) {
	const actionButton = event.target.closest('[data-site-action]');
	if (!actionButton) return;
	const site = driveState.sites.find(item => item.id === actionButton.dataset.siteId);
	if (!site) return;
	try {
		if (actionButton.dataset.siteAction === 'open') openSite(site);
		if (actionButton.dataset.siteAction === 'copy') await copySite(site);
		if (actionButton.dataset.siteAction === 'delete') {
			if (!window.confirm(`Delete site mapping "${site.id}"? Files remain untouched.`)) return;
			await deleteSite(site.id);
			showStatus(`Deleted mapping ${site.id}.`);
			await refresh();
		}
	} catch (error) {
		showError(error);
	}
}

async function copySite(site) {
	if (!driveState.aliasId) return;
	const value = siteUrl(site);
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(value);
		return;
	}
	const input = document.querySelector('#site-url');
	input.value = value;
	input.select();
	document.execCommand('copy');
}

function openSite(site) {
	if (!driveState.aliasId) return;
	window.open(siteUrl(site), '_blank', 'noopener');
}

function formatBytes(value) {
	const bytes = Number(value || 0);
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
	if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
	return `${(bytes / 1024 ** 3).toFixed(1)} GiB`;
}
