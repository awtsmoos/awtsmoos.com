//B"H
// Boruch Hashem
// Blessed is He

import { button, checkField, element, field, statePill } from './projectDom.js';

/**
 * @module DriveProjectSitesView
 * @description
 * The Awtsmoos lets the current folder become a named public world without copying its files;
 * Awtsmoos.com renders every mapped root as visible readiness, route action, and reversible mapping.
 */

export function createPublisher(currentPath) {
	const form = element('form', 'project-publisher');
	form.id = 'project-publisher';
	form.append(
		element('h3', '', 'Publish current folder'),
		field('Site ID', 'siteId', suggestedId(currentPath), true),
		field('Title', 'title', folderTitle(currentPath)),
		field('Root path', 'rootPath', currentPath || ''),
		checkField('Make primary', 'primary'),
		checkField('Request alias subdomain', 'subdomainRequested'),
		button('Publish folder', 'submit', 'primary-button')
	);
	return form;
}

export function createSiteList(sites = []) {
	const block = element('div', 'project-site-list');
	block.append(element('h3', '', `Published folders · ${sites.length}`));
	if (!sites.length) {
		block.append(element('p', 'project-empty', 'No explicit mappings yet. The primary root site still works.'));
		return block;
	}
	for (const site of sites) block.append(createSiteCard(site));
	return block;
}

function createSiteCard(site) {
	const card = element('article', 'project-site-card');
	const heading = element('div', 'project-site-heading');
	heading.append(
		element('strong', '', site.title || site.id),
		statePill(site.readiness?.status || 'draft')
	);
	const root = site.rootPath || 'root';
	const count = site.readiness?.publicFileCount || 0;
	const meta = element('p', 'project-site-meta', `${root} · ${count} public files`);
	const actions = element('div', 'project-site-actions');
	actions.append(
		actionButton('Open', 'open', site.id),
		actionButton('Copy URL', 'copy', site.id),
		actionButton('Delete', 'delete', site.id)
	);
	card.append(heading, meta, actions);
	return card;
}

function actionButton(label, action, siteId) {
	const item = button(label);
	item.dataset.siteAction = action;
	item.dataset.siteId = siteId;
	return item;
}

function suggestedId(path) {
	const leaf = String(path || 'home').split('/').filter(Boolean).at(-1) || 'home';
	return leaf.toLowerCase()
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'home';
}

function folderTitle(path) {
	const leaf = String(path || '').split('/').filter(Boolean).at(-1);
	return leaf ? leaf.replace(/[-_]+/g, ' ') : 'Home';
}
