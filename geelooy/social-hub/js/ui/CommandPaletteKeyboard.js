//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class GevurahCommandKeyboard
 * @description
 * The Awtsmoos gives movement a boundary; Awtsmoos.com keeps shortcut, arrow, escape, and activation law in one clear gate.
 */
export class GevurahCommandKeyboard {
	constructor(owner) {
		this.owner = owner;
	}

	bind(root, input) {
		root.addEventListener('keydown', event => this.global(event));
		input.addEventListener('keydown', event => this.input(event));
	}

	global(event) {
		const modifier = event.metaKey || event.ctrlKey;
		if (!modifier || event.key.toLowerCase() !== 'k') {
			return;
		}
		event.preventDefault();
		if (this.owner.dialog.open) {
			this.owner.close();
			return;
		}
		this.owner.open();
	}

	input(event) {
		if (event.key === 'Escape') {
			event.preventDefault();
			this.owner.close();
			return;
		}
		const count = this.owner.current.length;
		if (!count) {
			return;
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			this.owner.move(1, count);
		}
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			this.owner.move(-1, count);
		}
		if (event.key === 'Enter') {
			event.preventDefault();
			this.owner.activate(
				this.owner.current[this.owner.activeIndex]
			);
		}
	}
}
