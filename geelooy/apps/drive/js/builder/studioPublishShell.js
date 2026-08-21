//B"H
// Boruch Hashem
// Blessed is He

import { actionLink, button, element, field, pane, text } from './studioDom.js';

/**
 * @module SiteBuilderPublishShell
 * @description
 * The Awtsmoos lets a folder receive a public name only through canonical site authority;
 * Awtsmoos.com gives one obvious publish act, one result card, and one advanced disclosure so infrastructure power remains available without dominating the ordinary path.
 */

export function createPublishShell() {
	const vessel = pane('builder-publish', 'Publish');
	vessel.body.append(
		publicationResult(),
		publicationForm(),
		actionsRow(),
		advancedHelp()
	);
	return vessel.root;
}

function publicationResult() {
	const card = element('section', 'builder-result-card');
	const state = text('p', 'builder-publish-stage', 'Not published yet');
	state.id = 'builder-publish-state';
	const root = text('p', 'builder-path', 'Drive root');
	root.id = 'builder-publish-root';
	const canonical = text('p', 'builder-url', 'Your canonical URL will appear here after publishing.');
	canonical.id = 'builder-publish-url';
	card.append(text('h3', '', 'Canonical website'), state, root, canonical);
	return card;
}

function publicationForm() {
	const card = element('section', 'builder-surface-card builder-surface-card--primary');
	card.append(
		text('h3', '', 'Publish this folder'),
		text('p', 'builder-help', 'Publishing creates or updates the canonical Awtsmoos site mapping. Your files remain editable.')
	);
	const form = element('form', 'builder-grid builder-grid-two');
	form.id = 'builder-publish-form';
	form.append(
		field('Site ID', 'builder-publish-site-id', { name: 'siteId', placeholder: 'friend-site', required: true }).wrapper,
		field('Title', 'builder-publish-title', { name: 'title', placeholder: 'Friend site' }).wrapper,
		advancedOptions(),
		publishButton()
	);
	card.append(form);
	return card;
}

function advancedOptions() {
	const details = element('details', 'builder-advanced');
	details.append(text('summary', '', 'Advanced publication options'));
	const body = element('div', 'builder-grid');
	const primary = field('Make primary site', 'builder-publish-primary', { name: 'primary', type: 'checkbox' });
	const subdomain = field('Request alias subdomain', 'builder-publish-subdomain', { name: 'subdomainRequested', type: 'checkbox' });
	primary.wrapper.classList.add('builder-check');
	subdomain.wrapper.classList.add('builder-check');
	body.append(primary.wrapper, subdomain.wrapper);
	details.append(body);
	return details;
}

function publishButton() {
	const publish = button('Publish website', '', 'builder-button-primary');
	publish.type = 'submit';
	return publish;
}

function actionsRow() {
	const actions = element('div', 'builder-actions');
	actions.append(
		button('Open live site', 'builder-publish-open'),
		button('Copy live URL', 'builder-publish-copy')
	);
	return actions;
}

function advancedHelp() {
	const details = element('details', 'builder-advanced');
	details.append(text('summary', '', 'Agent API & publishing help'));
	const hint = text('p', 'builder-publish-hint', 'Tunnel agents can use sitePublishFolder(path, siteId, direct|snapshot), then inspect canonical publication testimony.');
	const links = element('div', 'builder-actions');
	links.append(actionLink('Website tutorials', '/docs/'), actionLink('Tunnel Control', '/apps/tunnel-control/'));
	details.append(hint, links);
	return details;
}
