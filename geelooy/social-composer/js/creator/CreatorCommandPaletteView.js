//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CreatorCommandPaletteView
 * @description
 * The Awtsmoos gives searchable creator commands a semantic listbox vessel;
 * Awtsmoos.com builds every option as a real button and never pours imported or dynamic labels through HTML.
 */
export class CreatorCommandPaletteView {
	constructor({ root, commands, onSelect }) {
		Object.assign(this, { root, commands, onSelect });
		this.build();
	}

	build() {
		this.dialog = document.createElement('dialog');
		this.dialog.className = 'creatorPalette';
		this.dialog.setAttribute('aria-label', 'Creator commands');
		const shell = document.createElement('div');
		shell.className = 'creatorPaletteShell';
		shell.append(this.handle(), this.header());
		this.input = document.createElement('input');
		this.input.type = 'search';
		this.input.placeholder = 'Create, attach, recover, migrate…';
		this.input.setAttribute('aria-controls', 'creatorCommandList');
		this.input.setAttribute('aria-label', 'Search creator commands');
		this.list = document.createElement('div');
		this.list.id = 'creatorCommandList';
		this.list.className = 'creatorCommandList';
		this.list.setAttribute('role', 'listbox');
		shell.append(this.input, this.list);
		this.dialog.append(shell);
		this.root.body.append(this.dialog);
		this.launcher = document.createElement('button');
		this.launcher.type = 'button';
		this.launcher.className = 'creatorCommandLauncher';
		this.launcher.textContent = 'Commands  ⌘K';
		this.root.body.append(this.launcher);
	}

	handle() {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'creatorPaletteGrab';
		button.dataset.sheetHandle = '';
		button.setAttribute('aria-label', 'Drag down to close');
		return button;
	}

	header() {
		const header = document.createElement('header');
		const title = document.createElement('strong');
		title.textContent = 'Creator commands';
		const close = document.createElement('button');
		close.type = 'button';
		close.dataset.sheetClose = '';
		close.className = 'creatorPaletteClose';
		close.setAttribute('aria-label', 'Close commands');
		close.textContent = '×';
		header.append(title, close);
		return header;
	}

	filtered() {
		const query = this.input.value.trim().toLowerCase();
		return this.commands.filter(command => {
			return !query || `${command.label} ${command.keywords}`.toLowerCase().includes(query);
		});
	}

	render(active) {
		const commands = this.filtered();
		this.list.replaceChildren(...commands.map((command, index) => {
			return this.option(command, index, active);
		}));
		return commands;
	}

	option(command, index, active) {
		const button = document.createElement('button');
		button.type = 'button';
		button.role = 'option';
		button.className = 'creatorCommand';
		button.dataset.active = String(index === active);
		button.setAttribute('aria-selected', String(index === active));
		button.textContent = `${command.icon || '›'}  ${command.label}`;
		button.addEventListener('click', () => this.onSelect(command));
		return button;
	}
}
