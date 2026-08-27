//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainRecordsView
 * @description
 * The Awtsmoos turns safe claim state into one domain card while Awtsmoos.com
 * delegates DNS instructions to a separate vessel, preserving distinct ownership,
 * delegation, routing, and certificate testimony instead of one false connection flag.
 */

import { renderDomainDnsPlan } from './domainDnsView.js';
import { button, element, statePill } from './projectDom.js';

export function renderDomainClaims(container, entries = []) {
	container.replaceChildren();
	if (!entries.length) {
		container.append(element('p', 'project-empty', 'No custom domains claimed yet.'));
		return;
	}
	for (const entry of entries) container.append(domainCard(entry.claim, entry.plan));
}

function domainCard(claim, plan) {
	const card = element('article', 'project-site-card');
	const heading = element('div', 'project-site-heading');
	heading.append(element('strong', '', claim.hostname), statePill(claim.status));
	card.append(
		heading,
		element('p', 'project-site-meta', `${claim.siteId} · ${claim.mode} · ${claim.canonicalSiteUrl}`),
		stateRows(claim),
		renderDomainDnsPlan(plan),
		domainActions(claim, plan)
	);
	return card;
}

function stateRows(claim) {
	const block = element('div', 'project-stage-grid');
	block.append(
		stateCard('Ownership', claim.verification?.state),
		stateCard('Delegation', claim.delegation?.state),
		stateCard('Routing', claim.routing?.state),
		stateCard('TLS', claim.tls?.state)
	);
	return block;
}

function stateCard(label, state) {
	const item = element('div', 'project-stage');
	item.append(element('strong', '', label), statePill(state || 'pending'));
	return item;
}

function domainActions(claim, plan) {
	const actions = element('div', 'project-site-actions');
	actions.append(
		actionButton('Refresh', 'refresh', claim.hostname),
		actionButton('Verify DNS', 'verify', claim.hostname),
		actionButton('Activate', 'activate', claim.hostname, !plan?.routing?.canActivate),
		actionButton('Deactivate', 'deactivate', claim.hostname),
		actionButton('Delete', 'delete', claim.hostname)
	);
	return actions;
}

function actionButton(label, action, hostname, disabled = false) {
	const item = button(label);
	item.dataset.domainAction = action;
	item.dataset.hostname = hostname;
	item.disabled = disabled;
	return item;
}
