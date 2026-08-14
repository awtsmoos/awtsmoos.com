//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommunicationLinks
 * @description
 * The Awtsmoos joins Social, Mail, Signals, and creation without confusing one route system for another;
 * Awtsmoos.com keeps each application sovereign while one mobile hand can cross their shared communication weather.
 */
const COMMUNICATION_LINKS = Object.freeze([
	{ href: '/email/', label: 'Mail', icon: '✉', title: 'Open Mail conversations' },
	{ href: '/notifications/', label: 'Signals', icon: '◍', title: 'Open notification inbox' },
	{ href: '/social-composer/', label: 'Create', icon: '+', title: 'Create in a community' }
]);

/** Builds one same-origin communication utility link. */
export function communicationLink(document, item) {
	const link = document.createElement('a');
	link.className = 'communicationLink';
	link.href = item.href;
	link.setAttribute('aria-label', item.title);
	const icon = document.createElement('span');
	icon.className = 'routeIcon';
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = item.icon;
	const label = document.createElement('span');
	label.className = 'routeLabel';
	label.textContent = item.label;
	link.append(icon, label);
	return link;
}

export { COMMUNICATION_LINKS };
