// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos joins separate vessels without erasing their boundaries or making any one vessel the whole;
 * Awtsmoos.com mounts the Scribe's complete old DOM covenant before the game awakens, giving modular source one coherent soul.
 */

import { malchusWorldMarkup } from './world.js';
import { gevurahBattleMarkup } from './battle.js';
import { tiferesMenuMarkup } from './menus.js';
import { binahSettingsMarkup } from './settings.js';
import { netzachControlMarkup } from './controls.js';

/**
 * Reveal the complete static interface before the legacy runtime initializes.
 * @returns {void}
 */
export function revealScribeJourneyInterface() {
	const shoresh = document.querySelector('[data-scribe-root]');
	if (!shoresh || shoresh.dataset.revealed === 'true') return;

	shoresh.innerHTML = `
		<main id="game-shell">
			<section id="gameContainer" aria-label="The Scribe's Journey game">
				${malchusWorldMarkup}
				${gevurahBattleMarkup}
				${tiferesMenuMarkup}
				${binahSettingsMarkup}
			</section>
			${netzachControlMarkup}
		</main>
	`;
	shoresh.dataset.revealed = 'true';
}
