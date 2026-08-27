//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteBuilderPublicationPanel
 * @description
 * The Awtsmoos lets the creator cross from source into public naming through one explicit guarded act;
 * Awtsmoos.com reuses the canonical site service, refreshes server testimony afterward, and never invents a live URL before the mapping returns as fact.
 */

export function installPublicationPanel(service, actions = {}) {
	const form = document.querySelector('#builder-publish-form');
	const siteId = document.querySelector('#builder-publish-site-id');
	const title = document.querySelector('#builder-publish-title');
	const primary = document.querySelector('#builder-publish-primary');
	const subdomain = document.querySelector('#builder-publish-subdomain');
	const open = document.querySelector('#builder-publish-open');
	const copy = document.querySelector('#builder-publish-copy');
	let canonicalUrl = '';
	form.addEventListener('submit', event => settle(event, publish));
	open.addEventListener('click', () => openLiveSite(canonicalUrl));
	copy.addEventListener('click', () => settle(null, () => copyLiveUrl(canonicalUrl)));
	return { update };

	async function publish() {
		const result = await service.publishApply({
			siteId: siteId.value.trim(),
			title: title.value.trim(),
			primary: primary.checked,
			subdomainRequested: subdomain.checked
		});
		actions.status?.(`Published ${result?.site?.id || siteId.value.trim()}. Refreshing the canonical URL…`);
		await actions.refresh?.();
	}

	function update(snapshot) {
		canonicalUrl = snapshot?.canonicalUrl || '';
		setIdleValue(siteId, snapshot?.siteId || suggestedId(snapshot?.rootPath));
		setIdleValue(title, snapshot?.brief?.name || folderTitle(snapshot?.rootPath));
		open.disabled = !canonicalUrl;
		copy.disabled = !canonicalUrl;
	}

	async function settle(event, action) {
		event?.preventDefault?.();
		try {
			await action();
		} catch (error) {
			actions.error?.(error);
		}
	}
}

function setIdleValue(field, value) {
	if (document.activeElement !== field && !field.value.trim()) {
		field.value = value || '';
	}
}

function suggestedId(path) {
	const leaf = String(path || 'home').split('/').filter(Boolean).at(-1) || 'home';
	return leaf.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'home';
}

function folderTitle(path) {
	const leaf = String(path || '').split('/').filter(Boolean).at(-1);
	return leaf ? leaf.replace(/[-_]+/g, ' ') : 'Home';
}

function openLiveSite(url) {
	if (url) {
		window.open(url, '_blank', 'noopener');
	}
}

async function copyLiveUrl(url) {
	if (!url) {
		return;
	}
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(url);
		return;
	}
	throw new Error('Clipboard API is unavailable. Copy the canonical URL shown above.');
}
