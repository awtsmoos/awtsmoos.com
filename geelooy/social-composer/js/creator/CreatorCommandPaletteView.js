//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CreatorCommandPaletteView
 * @description
 * The Awtsmoos gives searchable creator roads a semantic vessel where every visible state has a name;
 * Awtsmoos.com keeps labels, options, emptiness, and selection explicit so keyboard and thumb receive the same flame.
 */
export class CreatorCommandPaletteView {
	constructor({ root, commands, onSelect }) {
		Object.assign(this, { root, commands, onSelect });
		this.build();
	}

	/** @returns {void} Builds the dialog, launcher, search covenant, and listbox. */
	build() {
		this.dialog = this.root.createElement('dialog');
		this.dialog.className = 'creatorPalette';
		this.dialog.setAttribute('aria-label', 'Creator commands');
		const shell = this.root.createElement('div');
		shell.className = 'creatorPaletteShell';
		shell.append(this.handle(), this.header());
		const label = this.root.createElement('label');
		label.className = 'creatorPaletteLabel';
		label.htmlFor = 'creatorPaletteSearch';
		label.textContent = 'Search creator tools';
		this.input = this.root.createElement('input');
		this.input.id = 'creatorPaletteSearch';
		this.input.type = 'search';
		this.input.setAttribute('role', 'combobox');
		this.input.setAttribute('aria-autocomplete', 'list');
		this.input.setAttribute('aria-controls', 'creatorCommandList');
		this.input.setAttribute('aria-expanded', 'true');
		this.list = this.root.createElement('div');
		this.list.id = 'creatorCommandList';
		this.list.className = 'creatorCommandList';
		this.list.setAttribute('role', 'listbox');
		shell.append(label, this.input, this.list);
		this.dialog.append(shell);
		this.root.body.append(this.dialog);
		this.launcher = this.root.createElement('button');
		this.launcher.type = 'button';
		this.launcher.className = 'creatorCommandLauncher';
		this.launcher.textContent = 'Commands  ⌘K';
		this.root.body.append(this.launcher);
	}

	/** @returns {HTMLButtonElement} Creates the mobile drag handle without owning gesture law. */
	handle() {
		const button = this.root.createElement('button');
		button.type = 'button';
		button.className = 'creatorPaletteGrab';
		button.dataset.sheetHandle = '';
		button.setAttribute('aria-label', 'Drag down to close');
		return button;
	}

	/** @returns {HTMLElement} Creates the visible title and explicit close control. */
	header() {
		const header = this.root.createElement('header');
		const title = this.root.createElement('strong');
		title.textContent = 'Creator commands';
		const close = this.root.createElement('button');
		close.type = 'button';
		close.dataset.sheetClose = '';
		close.className = 'creatorPaletteClose';
		close.setAttribute('aria-label', 'Close commands');
		close.textContent = '×';
		header.append(title, close);
		return header;
	}

	/** @returns {Array<object>} Returns commands matching the current local search text. */
	filtered() {
		const query = this.input.value.trim().toLowerCase();
		return this.commands.filter(command => {
			const haystack = `${command.label} ${command.keywords}`.toLowerCase();
			return !query || haystack.includes(query);
		});
	}

	/** @param {number} active Active option index. @returns {Array<object>} Visible command records. */
	render(active) {
		const commands = this.filtered();
		const nodes = commands.length
			? commands.map((command, index) => this.option(command, index, active))
			: [this.emptyState()];
		this.list.replaceChildren(...nodes);
		const activeId = commands[active] ? `creatorCommandOption${active}` : '';
		this.input.setAttribute('aria-activedescendant', activeId);
		return commands;
	}

	/** @returns {HTMLElement} Makes an intentional no-results state instead of an empty hole. */
	emptyState() {
		const empty = this.root.createElement('p');
		empty.className = 'creatorCommandEmpty';
		empty.textContent = 'No creator tools match this search.';
		return empty;
	}

	/** @param {object} command Command record. @param {number} index Visible index. @param {number} active Active index. @returns {HTMLButtonElement} Accessible command option. */
	option(command, index, active) {
		const button = this.root.createElement('button');
		button.type = 'button';
		button.id = `creatorCommandOption${index}`;
		button.setAttribute('role', 'option');
		button.className = 'creatorCommand';
		button.dataset.active = String(index === active);
		button.setAttribute('aria-selected', String(index === active));
		button.textContent = `${command.icon || '›'}  ${command.label}`;
		button.addEventListener('click', () => this.onSelect(command));
		return button;
	}
}
