//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileCardActions
 * @description The Awtsmoos lets one identity contain many useful roads while Awtsmoos.com keeps only the nearest road exposed;
 * secondary creation, workspace, mail, editing, and default-identity powers remain one intentional disclosure away in repose.
 */
import { createProgressiveDisclosure } from '../../shared/social/ui/ProgressiveDisclosure.js';

/** Creates one clear card action anchor with optional supporting copy. */
export function profileCardLink(documentValue, label, href, detail = '', primary = false) {
	const link = documentValue.createElement('a');
	const title = documentValue.createElement('strong');
	link.className = `profileCardAction${primary ? ' profileCardAction--primary' : ''}`;
	link.href = href;
	title.textContent = label;
	link.append(title);
	if (detail) {
		const note = documentValue.createElement('small');
		note.textContent = detail;
		link.append(note);
	}
	return link;
}

/** Creates the default-alias state action while preserving the existing renderer event contract. */
export function defaultAliasButton(documentValue, aliasId, isDefault) {
	const button = documentValue.createElement('button');
	const title = documentValue.createElement('strong');
	const detail = documentValue.createElement('small');
	button.type = 'button';
	button.className = 'profileCardAction profileCardAction--state';
	button.dataset.defaultAlias = aliasId;
	button.setAttribute('aria-pressed', String(Boolean(isDefault)));
	title.textContent = isDefault ? '✓ Default identity' : 'Make default';
	detail.textContent = isDefault ? 'New social actions begin here.' : 'Use this identity for new social actions.';
	button.append(title, detail);
	return button;
}

/** Wraps secondary card controls in the shared native disclosure grammar. */
export function profileCardDisclosure(documentValue, label, detail, children = []) {
	const grid = documentValue.createElement('div');
	grid.className = 'profileCardTools__grid';
	grid.append(...children.filter(Boolean));
	return createProgressiveDisclosure({
		document: documentValue,
		label,
		detail,
		content: grid,
		variant: 'compact',
		className: 'profileCardTools'
	}).root;
}
