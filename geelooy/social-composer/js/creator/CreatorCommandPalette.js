//B"H
//Boruch Hashem
//Blessed is He

import { FutureSheet } from '../../../shared/ui/future/FutureSheet.js';
import { CreatorCommandActions } from './CreatorCommandActions.js';
import { creatorCommands } from './CreatorCommandCatalog.js';
import { CreatorCommandPaletteView } from './CreatorCommandPaletteView.js';

/**
 * @class CreatorCommandPalette
 * @description
 * The Awtsmoos lets one chord unfold many creator roads while empty searches remain bounded and bright;
 * Awtsmoos.com keeps arrow travel, Enter, Escape, visible closing, and restored focus moving in one truthful light.
 */
export class CreatorCommandPalette {
	constructor(options) {
		this.actions = new CreatorCommandActions(options);
		this.commands = creatorCommands();
		this.active = 0;
		this.view = new CreatorCommandPaletteView({
			root: options.root,
			commands: this.commands,
			onSelect: command => this.execute(command)
		});
		this.sheet = new FutureSheet(this.view.dialog);
	}

	/** @returns {void} Connects keyboard and launcher events after every visual vessel exists. */
	initialize() {
		document.addEventListener('keydown', event => this.globalKey(event));
		this.view.input.addEventListener('input', () => this.render());
		this.view.input.addEventListener('keydown', event => this.inputKey(event));
		this.view.launcher.addEventListener('click', () => this.open(this.view.launcher));
		this.render();
	}

	/** @param {KeyboardEvent} event Global key event. @returns {void} Opens on Cmd/Ctrl-K only. */
	globalKey(event) {
		if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
		event.preventDefault();
		this.open(document.activeElement);
	}

	/** @param {Element|null} opener Focus-return origin. @returns {void} Opens with clean query and selection. */
	open(opener) {
		this.active = 0;
		this.view.input.value = '';
		this.render();
		this.sheet.open(opener);
		this.view.input.focus();
	}

	/** @returns {Array<object>} Renders visible commands and clamps selection to a real row. */
	render() {
		const commands = this.view.filtered();
		this.active = commands.length
			? Math.min(this.active, commands.length - 1)
			: 0;
		return this.view.render(this.active);
	}

	/** @param {KeyboardEvent} event Search keyboard event. @returns {void} Moves, selects, or closes safely. */
	inputKey(event) {
		const commands = this.view.filtered();
		if (event.key === 'Escape') {
			event.preventDefault();
			this.sheet.close();
			return;
		}
		if (!commands.length) {
			if (['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) event.preventDefault();
			return;
		}
		if (event.key === 'ArrowDown') {
			this.active = Math.min(this.active + 1, commands.length - 1);
		} else if (event.key === 'ArrowUp') {
			this.active = Math.max(this.active - 1, 0);
		} else if (event.key === 'Enter') {
			this.execute(commands[this.active]);
		} else {
			return;
		}
		event.preventDefault();
		this.render();
	}

	/** @param {object} command Canonical creator command. @returns {*} Action result from the command router. */
	execute(command) {
		this.sheet.close();
		return this.actions.run(command.id);
	}
}
