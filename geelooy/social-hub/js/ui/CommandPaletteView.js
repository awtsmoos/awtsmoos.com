//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MalchusCommandPaletteView
 * @description
 * The Awtsmoos lets intention descend into visible vessels; Awtsmoos.com gives the command crown its dialog, close gate, options, and visible keyboard path.
 */
export class MalchusCommandPaletteView {
	constructor(root = document) {
		this.root = root;
	}

	createTrigger(open) {
		const button = this.root.createElement('button');
		button.type = 'button';
		button.className = 'futureCommandTrigger';
		button.textContent = 'Jump · K';
		button.title = 'Open social navigation — Ctrl/Command K';
		button.setAttribute('aria-keyshortcuts', 'Control+K Meta+K');
		button.addEventListener('click', open);
		return button;
	}

	createDialog(onInput, onClose) {
		const dialog = this.root.createElement('dialog');
		dialog.className = 'futureCommandPalette';
		dialog.setAttribute('aria-label', 'Social navigation');
		dialog.innerHTML = this.shell();
		const input = dialog.querySelector('.futureCommandInput');
		const list = dialog.querySelector('.futureCommandList');
		const close = dialog.querySelector('.futureCommandClose');
		input.addEventListener('input', onInput);
		close.addEventListener('click', onClose);
		dialog.addEventListener('click', event => {
			if (event.target === dialog) {
				onClose();
			}
		});
		return { dialog, input, list };
	}

	shell() {
		return [
			'<div class="futureCommandShell">',
			'<div class="futureCommandTop">',
			'<p class="futureCommandEyebrow">Awtsmoos Social</p>',
			'<button class="futureCommandClose" type="button">Close</button>',
			'</div>',
			'<label for="futureCommandInput">Jump anywhere</label>',
			'<input class="futureCommandInput" id="futureCommandInput" role="combobox" aria-controls="futureCommandList" aria-expanded="true" autocomplete="off" placeholder="Search social spaces…">',
			'<div class="futureCommandList" id="futureCommandList" role="listbox"></div>',
			'<p class="futureCommandHint">↑ ↓ move · Enter open · Esc close</p>',
			'</div>'
		].join('');
	}

	renderOptions(list, actions, activeIndex, activate) {
		if (!actions.length) {
			const empty = this.root.createElement('p');
			empty.className = 'futureCommandEmpty';
			empty.textContent = 'No social destination matches that search.';
			list.replaceChildren(empty);
			return;
		}
		list.replaceChildren(
			...actions.map((action, index) =>
				this.option(action, index, activeIndex, activate)
			)
		);
		list.querySelector('[data-active="true"]')?.scrollIntoView({
			block: 'nearest',
			behavior: 'auto'
		});
	}

	option(action, index, activeIndex, activate) {
		const button = this.root.createElement('button');
		button.type = 'button';
		button.id = `futureCommandOption${index}`;
		button.className = 'futureCommandOption';
		button.setAttribute('role', 'option');
		button.setAttribute('aria-selected', String(index === activeIndex));
		button.dataset.active = String(index === activeIndex);
		const strong = this.root.createElement('strong');
		strong.textContent = action.label;
		const span = this.root.createElement('span');
		span.textContent = action.description;
		button.append(strong, span);
		button.addEventListener('click', () => activate(action));
		return button;
	}
}
