//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainPanel
 * @description
 * The Awtsmoos gives domain intent a visible form before DNS testimony appears.
 * Awtsmoos.com lets the owner choose a real mapped site and DNS mode, while its
 * unavailable authoritative nameservers remain explicit instead of aspirational.
 */

import { button, element, field } from './projectDom.js';

export function createDomainPanel(sites = []) {
	const root = element('section', 'project-site-list');
	const heading = element('div', 'project-site-heading');
	heading.append(
		element('h3', '', 'Custom domains'),
		element('span', 'project-state', 'Bring your own domain')
	);
	const intro = element(
		'p',
		'project-site-meta',
		'Keep DNS at your provider or delegate to your own external nameservers. Awtsmoos shows only server-attested records.'
	);
	const form = element('form', 'project-publisher');
	form.dataset.domainClaimForm = 'true';
	const site = selectField('Published site', 'siteId', siteOptions(sites));
	const hostname = field('Domain name', 'hostname', '', true);
	const mode = selectField('DNS mode', 'mode', [
		['external-dns', 'Keep DNS at current provider'],
		['custom-nameservers', 'Use custom external nameservers'],
		['awtsmoos-nameservers', 'Awtsmoos nameservers — not deployed', true]
	]);
	const nameservers = field('Custom nameservers', 'nameservers', '');
	nameservers.dataset.domainNameservers = 'true';
	const submit = button('Claim domain', 'submit', 'primary-button');
	submit.disabled = sites.length === 0;
	form.append(
		element('h3', '', 'Attach a domain you already own'),
		site,
		hostname,
		mode,
		nameservers,
		submit
	);
	const status = element('p', 'project-site-meta', sites.length
		? 'DNS state will appear after the claim is saved.'
		: 'Publish a named site first; domains can only attach to real site mappings.');
	status.dataset.domainStatus = 'true';
	const list = element('div', 'project-site-list');
	list.dataset.domainList = 'true';
	root.append(heading, intro, form, status, list);
	return { root, form, list, mode: mode.querySelector('select'), nameservers, status };
}

function selectField(labelText, name, options) {
	const wrapper = element('label');
	wrapper.append(document.createTextNode(labelText));
	const select = document.createElement('select');
	select.name = name;
	for (const [value, label, disabled = false] of options) {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = label;
		option.disabled = disabled;
		select.append(option);
	}
	wrapper.append(select);
	return wrapper;
}

function siteOptions(sites) {
	if (!sites.length) return [['', 'No published site mappings yet', true]];
	return sites.map(site => [site.id, site.title || site.id]);
}
