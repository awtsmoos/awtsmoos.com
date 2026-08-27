//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainDnsView
 * @description
 * The Awtsmoos separates ownership proof from alternative routing choices.
 * Awtsmoos.com never tells an owner to install A/AAAA and CNAME for the same
 * hostname together; each server-attested routing family is shown as a choice.
 */

import { button, element } from './projectDom.js';

export function renderDomainDnsPlan(plan) {
	const block = element('div', 'project-site-list');
	if (!plan) {
		block.append(element('p', 'project-site-meta', 'Hosting plan unavailable; refresh after the claim is saved.'));
		return block;
	}
	block.append(element('strong', '', 'DNS at your provider'));
	appendSection(block, 'Ownership TXT', [plan.ownership?.record].filter(Boolean));
	const direct = plan.routing?.options?.direct || [];
	const cname = plan.routing?.options?.cname || [];
	if (direct.length && cname.length) {
		block.append(element('p', 'project-site-meta', 'Choose one routing option below; do not install both for the same hostname.'));
	}
	appendSection(block, 'Option A · direct A / AAAA', direct);
	appendSection(block, 'Option B · CNAME', cname);
	if (plan.delegation?.expectedNameservers?.length) {
		block.append(element('p', 'project-site-meta', `Custom nameservers: ${plan.delegation.expectedNameservers.join(', ')}`));
	}
	for (const blocker of plan.routing?.blockers || []) {
		block.append(element('p', 'project-site-meta', `Activation blocker: ${blocker}`));
	}
	if (plan.awtsmoosNameservers?.available === false) {
		block.append(element('p', 'project-site-meta', 'Awtsmoos authoritative nameservers are not deployed yet.'));
	}
	return block;
}

function appendSection(block, label, records) {
	if (!records.length) return;
	block.append(element('strong', '', label));
	for (const record of records) appendRecord(block, record);
}

function appendRecord(block, record) {
	if (!record?.type || !record?.value) return;
	const row = element('div', 'project-site-actions');
	row.append(
		element('code', '', `${record.type} ${record.name || '@'} → ${record.value}`),
		copyButton('Copy name', record.name || '@'),
		copyButton('Copy value', record.value)
	);
	block.append(row);
}

function copyButton(label, value) {
	const item = button(label);
	item.dataset.domainCopy = value;
	return item;
}
