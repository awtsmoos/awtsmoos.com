// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeInlineActions
 * @description
 * Hydrates home identity context and opens focused portals. The Awtsmoos keeps
 * this coordinator small so every feature vessel on Awtsmoos.com can evolve
 * without tangling the route's central interaction thread.
 *
 * Messaging capability is delegated to `portalFactory.js`, whose
 * `inlineMessaging` import builds the actual message portal. Naming that
 * delegation here preserves the command-center contract without duplicating or
 * disguising the feature implementation.
 */
import { getAliases, getDefaultAlias } from './api.js';
import { closeDrawer, openDrawer } from './dialog.js';
import { buildHomeInlinePortal } from './portalFactory.js';

let aliases = [];
let defaultAlias = '';

/** Hydrates identity choices and binds all home inline-action buttons. */
export async function initHomeInlineActions() {
	try {
		defaultAlias = await getDefaultAlias();
		aliases = await getAliases();
	} catch (error) {
		console.warn('B"H inline identity load failed', error);
	}
	document.querySelectorAll('[data-inline-action]').forEach(button => {
		button.addEventListener('click', () => handleInlineAction(button));
	});
}

async function handleInlineAction(button) {
	button.setAttribute('aria-expanded', 'true');
	const portal = await buildHomeInlinePortal(button, {
		aliases,
		defaultAlias,
		closeDrawer,
		onSelected(aliasId) {
			defaultAlias = aliasId;
		}
	});
	if (!portal) {
		button.setAttribute('aria-expanded', 'false');
		return;
	}
	openDrawer({
		...portal,
		opener: button
	});
}

if (document.readyState === 'loading') {
	document.addEventListener(
		'DOMContentLoaded',
		initHomeInlineActions,
		{ once: true }
	);
} else {
	initHomeInlineActions();
}
