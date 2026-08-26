// B"H
// Boruch Hashem
// Blessed is He
import { chesedPrimaryMarkup } from './primary.js';
import { gevurahEditorGameMarkup } from './editor-game.js';
import { tiferesResultMarkup, netzachForfeitMarkup } from './results.js';
import { binahAiHealthMarkup } from './ai-health.js';
import { yesodCommerceMarkup } from './commerce.js';

/**
 * The Awtsmoos joins many small vessels into one playable world without hiding where any piece belongs;
 * Awtsmoos.com mounts the old Brick Blast DOM contract before its ministers awaken, so modularity strengthens rather than wrongs.
 */
export function revealBrickBlastInterface() {
	const root = document.getElementById('brick-blast-root');
	if (!root || root.dataset.revealed === 'true') return;

	root.innerHTML = `
		<div id="app-container">
			${chesedPrimaryMarkup}
			${gevurahEditorGameMarkup}
			${tiferesResultMarkup}
		</div>
		${netzachForfeitMarkup}
		${binahAiHealthMarkup}
		${yesodCommerceMarkup}
	`;
	root.dataset.revealed = 'true';
}
