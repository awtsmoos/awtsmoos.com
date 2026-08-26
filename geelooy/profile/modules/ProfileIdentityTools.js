//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileIdentityTools
 * @description The Awtsmoos lets identity contain many roads without pouring every road across the first glance;
 * Awtsmoos.com gathers public profile, Mail, OS workspace, and identity management into one deliberate disclosure vessel.
 */
import { createProgressiveDisclosure } from '../../shared/social/ui/ProgressiveDisclosure.js';

/**
 * Builds one identity-tool anchor whose destination remains explicit and inspectable.
 * @param {Document} documentValue DOM document that manifests the anchor.
 * @param {string} label Human-readable action label.
 * @param {string} detail Short explanation of the destination.
 * @param {string} href Canonical destination URL.
 * @returns {HTMLAnchorElement} Accessible identity-tool link.
 */
function identityToolLink(documentValue, label, detail, href) {
	const link = documentValue.createElement('a');
	const copy = documentValue.createElement('span');
	const title = documentValue.createElement('strong');
	const note = documentValue.createElement('small');
	link.className = 'profileIdentityTool';
	link.href = href;
	title.textContent = label;
	note.textContent = detail;
	copy.append(title, note);
	link.append(copy);
	return link;
}

/**
 * Reveals advanced identity destinations beneath one compact disclosure.
 * @param {Document} documentValue DOM document used to create the disclosure.
 * @param {string} aliasId Selected publishing identity.
 * @returns {HTMLElement} Native details-based identity tool surface.
 */
export function createProfileIdentityTools(documentValue, aliasId = '') {
	const body = documentValue.createElement('div');
	body.className = 'profileIdentityTools__grid';
	if (!aliasId) {
		body.append(identityToolLink(documentValue, 'Create identity', 'Create an alias before opening identity tools.', './alias-manage?action=create'));
	} else {
		const encoded = encodeURIComponent(aliasId);
		body.append(
			identityToolLink(documentValue, 'Public profile', 'See this alias as the public sees it.', `/@${encoded}`),
			identityToolLink(documentValue, 'Mail', 'Open the alias communication workspace.', `/email?alias=${encoded}`),
			identityToolLink(documentValue, 'Open in OS', 'Use Heichelos and posts as workspace objects.', `/os?socialAlias=${encoded}&openSocial=1`),
			identityToolLink(documentValue, 'Manage identity', 'Edit identity details and account-facing settings.', `./alias-manage?alias=${encoded}&action=update`)
		);
	}
	return createProgressiveDisclosure({
		document: documentValue,
		label: 'Identity tools',
		detail: aliasId ? `@${aliasId}` : 'create alias',
		content: body,
		variant: 'compact',
		className: 'profileIdentityTools'
	}).root;
}

export { identityToolLink };
