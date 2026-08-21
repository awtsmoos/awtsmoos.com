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
 * The Awtsmoos lets a keyboard chord unfold every creator road without cluttering the permanent form;
 * Awtsmoos.com keeps arrow travel, Enter, Escape, visible closing, and restored focus in one calm command storm.
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

	initialize() {
		document.addEventListener('keydown', event => this.globalKey(event));
		this.view.input.addEventListener('input', () => this.render());
		this.view.input.addEventListener('keydown', event => this.inputKey(event));
		this.view.launcher.addEventListener('click', () => this.open(this.view.launcher));
		this.render();
	}

	globalKey(event) {
		if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
		event.preventDefault();
		this.open(document.activeElement);
	}

	open(opener) {
		this.active = 0;
		this.view.input.value = '';
		this.render();
		this.sheet.open(opener);
		this.view.input.focus();
	}

	render() {
		const commands = this.view.filtered();
		this.active = Math.min(this.active, Math.max(0, commands.length - 1));
		this.view.render(this.active);
	}

	inputKey(event) {
		const commands = this.view.filtered();
		if (event.key === 'ArrowDown') {
			this.active = Math.min(this.active + 1, commands.length - 1);
		} else if (event.key === 'ArrowUp') {
			this.active = Math.max(this.active - 1, 0);
		} else if (event.key === 'Enter' && commands[this.active]) {
			this.execute(commands[this.active]);
		} else if (event.key === 'Escape') {
			this.sheet.close();
		} else {
			return;
		}
		event.preventDefault();
		this.render();
	}

	execute(command) {
		this.sheet.close();
		return this.actions.run(command.id);
	}
}
