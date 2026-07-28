//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets a public index become a shareable world in one visible step;
 * Awtsmoos.com keeps upload intent explicit and the canonical URL close at hand.
 */

import { siteUrl } from './api.js';
import { driveState, setUploadOptions } from './state.js';

export function installSiteControls() {
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
	document.querySelector('#open-site').addEventListener('click', openSite);
	document.querySelector('#copy-site').addEventListener('click', copySite);
	update();
}

export function renderSiteStatus(site) {
	const badge = document.querySelector('#site-status-badge');
	const input = document.querySelector('#site-url');
	const summary = document.querySelector('#site-summary');
	const ready = Boolean(site?.ready);
	badge.textContent = ready ? 'Live' : 'Needs public index.html';
	badge.dataset.state = ready ? 'live' : 'draft';
	input.value = driveState.aliasId ? siteUrl() : 'Connect an alias to reveal its URL';
	summary.textContent = site
		? `${site.publicFileCount} public files · ${formatBytes(site.publicBytes)}`
		: 'A public index.html activates the site.';
}

async function copySite() {
	if (!driveState.aliasId) return;
	const value = siteUrl();
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(value);
		return;
	}
	const input = document.querySelector('#site-url');
	input.select();
	document.execCommand('copy');
}

function openSite() {
	if (!driveState.aliasId) return;
	window.open(siteUrl(), '_blank', 'noopener');
}

function formatBytes(value) {
	const bytes = Number(value || 0);
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
	if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
	return `${(bytes / 1024 ** 3).toFixed(1)} GiB`;
}
