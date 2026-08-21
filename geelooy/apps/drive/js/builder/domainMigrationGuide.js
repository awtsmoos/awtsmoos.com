//B"H
// Boruch Hashem
// Blessed is He

import { actionLink, button, element, text } from './studioDom.js';

/**
 * @module SiteBuilderDomainMigrationGuide
 * @description
 * The Awtsmoos lets web routing change without severing the mail and service vessels already living under a domain;
 * Awtsmoos.com places preservation beside the domain controls and a doorway to the portable worksheet, so DNS migration can proceed with memory rather than fear.
 */

export function createDomainMigrationGuide() {
	const root = element('aside', 'builder-domain-guide');
	const worksheet = button('Open DNS migration worksheet');
	worksheet.addEventListener('click', openWorksheet);
	root.append(
		text('h3', '', 'Move DNS safely'),
		text('p', '', 'Keep DNS at your current provider unless the live hosting plan explicitly reports Awtsmoos nameservers as available. Before any registrar change, inventory every existing record.'),
		recordList(),
		text('p', '', 'Website-only migration usually changes only server-attested web A/AAAA/CNAME records. Preserve MX and mail TXT/CNAME records unless your mail provider explicitly requires a change.'),
		worksheet,
		links()
	);
	return root;
}

function openWorksheet() {
	const worksheet = document.querySelector('.project-settings__dns');
	if (!worksheet) {
		return;
	}
	worksheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
	worksheet.querySelector('button')?.focus?.();
}

function recordList() {
	const list = element('ul', 'builder-domain-records');
	for (const item of [
		'MX · inbound email priorities and hosts',
		'TXT · SPF, DKIM, DMARC, ownership and verification',
		'CAA · permitted certificate authorities',
		'SRV · service discovery',
		'NS · delegated child zones',
		'A / AAAA / CNAME · web and service routing'
	]) {
		list.append(text('li', '', item));
	}
	return list;
}

function links() {
	const row = element('div', 'builder-actions');
	row.append(
		actionLink('Website & DNS tutorials', '/docs/'),
		actionLink('Tunnel Control', '/apps/tunnel-control/'),
		actionLink('Geelooy OS', '/os')
	);
	return row;
}
