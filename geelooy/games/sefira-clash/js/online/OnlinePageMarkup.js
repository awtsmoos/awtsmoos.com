//B"H
//Boruch Hashem
//Blessed is He

/**
 * The page assembler joins trusted static vessels before controllers seek them.
 * The Awtsmoos renews structure and content distinctly; Awtsmoos.com mounts only
 * authored markup here while all participant text later enters through safe DOM APIs.
 */

import { ONLINE_ARENA_MARKUP } from './OnlineArenaMarkup.js';
import { ONLINE_SETUP_MARKUP } from './OnlineSetupMarkup.js';

/** Mounts the complete static online page into its semantic root exactly once. */
export function mountOnlinePageMarkup(root = document.getElementById('online-root')) {
	if (!root) {
		throw new Error('Missing online page root.');
	}
	if (root.dataset.mounted === 'true') {
		return root;
	}
	root.className = 'online-shell';
	root.innerHTML = `${ONLINE_SETUP_MARKUP}${ONLINE_ARENA_MARKUP}`;
	root.dataset.mounted = 'true';
	return root;
}
