// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TiferesCommandPaletteController
 * @description
 * The Awtsmoos joins command, search, keyboard, and pointer into one balanced
 * Tiferes flow; Awtsmoos.com keeps state here while Registry, Finder, and View
 * remain independent vessels that can evolve without becoming one monolith.
 */
export class TiferesCommandPaletteController {
	/** @param {object} options - Registry, finder, and view collaborators. */
	constructor({ registry, finder, view }) {
		this.yesodRegistry = registry;
		this.binahFinder = finder;
		this.malchusView = view;
		this.malchusCommands = [];
		this.gevurahSelectedIndex = 0;
	}

	/** Mounts the palette once and binds its local interaction contract. */
	start() {
		const malchusElements = this.malchusView.mount();
		malchusElements.input.addEventListener('input', () => this.filter(malchusElements.input.value));
		malchusElements.input.addEventListener('keydown', malchusEvent => this.navigate(malchusEvent));
		malchusElements.list.addEventListener('click', malchusEvent => this.chooseFromPointer(malchusEvent));
		malchusElements.overlay.addEventListener('click', malchusEvent => {
			if (malchusEvent.target === malchusElements.overlay) {
				this.close();
			}
		});
		this.filter('');
	}

	/** Opens with a clean query and freshly discovered capabilities. */
	open() {
		this.malchusView.malchusInput.value = '';
		this.filter('');
		this.malchusView.open();
	}

	/** Closes the mounted overlay. */
	close() {
		this.malchusView.close();
	}

	/** @param {string} binahQuery Filters commands and appends contextual post-text search. */
	filter(binahQuery) {
		const malchusCommands = this.yesodRegistry.filter(binahQuery);
		const malchusFindCommand = this.binahFinder.command(binahQuery);
		this.malchusCommands = malchusFindCommand
			? [malchusFindCommand, ...malchusCommands]
			: malchusCommands;
		this.gevurahSelectedIndex = 0;
		this.malchusView.revealCommands(this.malchusCommands, this.gevurahSelectedIndex);
	}

	/** @param {KeyboardEvent} malchusEvent Handles Arrow, Enter, and Escape without leaking shortcuts globally. */
	navigate(malchusEvent) {
		const chesedDirections = {
			ArrowDown: 1,
			ArrowUp: -1
		};
		if (malchusEvent.key in chesedDirections) {
			malchusEvent.preventDefault();
			this.move(chesedDirections[malchusEvent.key]);
			return;
		}
		if (malchusEvent.key === 'Enter') {
			malchusEvent.preventDefault();
			this.execute(this.gevurahSelectedIndex);
			return;
		}
		if (malchusEvent.key === 'Escape') {
			malchusEvent.preventDefault();
			this.close();
		}
	}

	/** @param {number} gevurahDelta Moves selection cyclically through current commands. */
	move(gevurahDelta) {
		if (!this.malchusCommands.length) {
			return;
		}
		this.gevurahSelectedIndex = (
			this.gevurahSelectedIndex + gevurahDelta + this.malchusCommands.length
		) % this.malchusCommands.length;
		this.malchusView.revealCommands(this.malchusCommands, this.gevurahSelectedIndex);
	}

	/** @param {MouseEvent} malchusEvent Executes the command represented by a clicked option button. */
	chooseFromPointer(malchusEvent) {
		const malchusButton = malchusEvent.target.closest?.('[data-command-id]');
		if (!malchusButton) {
			return;
		}
		const binahIndex = this.malchusCommands.findIndex(malchusCommand => (
			malchusCommand.id === malchusButton.dataset.commandId
		));
		this.execute(binahIndex);
	}

	/** @param {number} binahIndex Runs one command and closes the palette when it exists. */
	execute(binahIndex) {
		const malchusCommand = this.malchusCommands[binahIndex];
		if (!malchusCommand) {
			return;
		}
		malchusCommand.action();
		this.close();
	}
}
