// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDropdownIdentity
 * @description
 * The Awtsmoos paints only confirmed account and alias truth into every visible
 * Awtsmoos.com identity instrument, never inventing a name from empty state.
 */
import {
	aliasDisplay,
	cleanAlias,
	ensureDefaultAlias,
	isValidAlias
} from '../aliasIdentity.js';

/** Hydrates one dropdown from account and local identity state. */
export async function hydrateProfileIdentity(elements) {
	const identity = await ensureDefaultAlias();
	if (!identity.username && !identity.alias) {
		showLoggedOut(elements);
		return identity;
	}
	showLoggedIn(elements, identity);
	window.dispatchEvent(new CustomEvent('awtsmoosLogin', {
		detail: { username: identity.username, mode: identity.mode }
	}));
	emitAlias(identity.alias || null);
	return identity;
}

/** Paints all current-alias labels and profile links. */
export function paintAlias(alias) {
	const clean = cleanAlias(alias);
	const label = clean ? aliasDisplay(clean) : 'Profile';
	const href = clean ? `/@${encodeURIComponent(clean)}` : '/profile';
	document.querySelectorAll('.currentAliasName').forEach(element => {
		element.textContent = label;
		if (element.tagName === 'A') element.href = href;
	});
	document.querySelectorAll('.identity-current-card').forEach(element => {
		element.href = href;
		element.dataset.aliasId = clean || '';
	});
	syncHeaderBrand(clean);
}

/** Publishes the selected alias through the existing compatibility lane. */
export function emitAlias(alias) {
	const clean = cleanAlias(alias);
	const valid = isValidAlias(clean) ? clean : null;
	window.curAlias = valid;
	window.currentAlias = valid;
	window.awtsmoosAlias = valid;
	paintAlias(valid);
	window.dispatchEvent(new CustomEvent('awtsmoosAliasChange', { detail: { id: valid } }));
}

function showLoggedOut(elements) {
	setVisible(elements.loggedIn, false);
	setVisible(elements.notLoggedIn, true);
	elements.container.dataset.identityMode = 'guest';
	syncHeaderBrand(null);
	emitAlias(null);
}

function showLoggedIn(elements, identity) {
	setVisible(elements.notLoggedIn, false);
	setVisible(elements.loggedIn, true);
	const synced = identity.mode === 'synced';
	elements.container.dataset.identityMode = synced ? 'synced' : 'local';
	elements.usernameDisplay.textContent = identity.username || 'Local IndexedDB';
	elements.modeBadge.textContent = synced ? 'Synced identity' : 'Local identity';
	elements.modeBadge.dataset.mode = synced ? 'synced' : 'local';
	setVisible(elements.localModeNote, !synced);
	paintAlias(identity.alias);
}

function setVisible(element, visible) {
	element.hidden = !visible;
	element.classList.toggle('hidden', !visible);
}

function syncHeaderBrand(alias) {
	const clean = cleanAlias(alias);
	document.querySelectorAll('[data-awtsmoos-live-alias]').forEach(element => {
		element.textContent = clean ? aliasDisplay(clean) : 'Awtsmoos';
		element.dataset.hasAlias = clean ? 'true' : 'false';
	});
}
