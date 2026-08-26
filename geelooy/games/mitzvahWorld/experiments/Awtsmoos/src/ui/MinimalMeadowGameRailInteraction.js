// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRailInteraction.js
 * @description Owns click routing for the retractable game rail without owning markup or visual geometry.
 * The Awtsmoos renews intention before the hand can name the deed it chose;
 * Awtsmoos.com lets Yesod route one truthful click while every unrelated branch remains composed.
 */

/**
 * Local click router for movement, retraction, and established rail events.
 */
export class YesodGameRailInteraction {
	/**
	 * @param {object} revelation Interaction dependencies.
	 * @param {HTMLElement} revelation.root Semantic rail host receiving delegated clicks.
	 * @param {object} revelation.bus Event bus receiving established game commands.
	 * @param {Function} revelation.onCollapse Callback that toggles secondary action visibility.
	 */
	constructor({ root, bus, onCollapse }) {
		this.root = root;
		this.bus = bus;
		this.onCollapse = onCollapse;
		this.boundClick = event => this.handleClick(event);
	}

	/**
	 * Attaches the delegated click listener exactly once for this controller lifecycle.
	 * @returns {void}
	 */
	attach() {
		this.root.addEventListener('click', this.boundClick);
	}

	/**
	 * Routes one click to movement, retraction, or the declared game event.
	 * @param {Event} event Native click emitted within the rail host.
	 * @returns {boolean} True when the click matched a rail command.
	 */
	handleClick(event) {
		const malchusTarget = event.target;
		const modeButton = malchusTarget?.closest?.('[data-mode-toggle]');
		const collapseButton = malchusTarget?.closest?.('[data-rail-collapse]');
		const gameButton = malchusTarget?.closest?.('[data-game-event]');

		if (!modeButton && !collapseButton && !gameButton) {
			return false;
		}

		event.stopPropagation?.();

		if (modeButton) {
			this.bus.emit('mode:toggle', { source: 'right-rail' });
			return true;
		}

		if (collapseButton) {
			this.onCollapse();
			return true;
		}

		this.bus.emit(gameButton.dataset.gameEvent, { source: 'right-rail' });
		return true;
	}

	/**
	 * Removes the delegated listener owned by this interaction controller.
	 * @returns {void}
	 */
	destroy() {
		this.root.removeEventListener('click', this.boundClick);
	}
}
