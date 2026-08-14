// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos translates a few keys into visible intention while the human hand remains rooted in the one searching field.

export class OmniboxKeyboard {
	constructor(options) {
		this.navigator = options.navigator;
		this.activateHandler = options.activateHandler;
		this.activeHandler = options.activeHandler;
		this.closeHandler = options.closeHandler;
	}

	handle(event) {
		const movement = this.resolveMovement(event.key);

		if (movement !== null) {
			event.preventDefault();
			this.activeHandler(movement());
			return true;
		}

		if (event.key === "Escape") {
			event.preventDefault();
			this.closeHandler();
			return true;
		}

		if (event.key === "Enter" && this.navigator.hasActiveOption()) {
			event.preventDefault();
			this.activateHandler(this.navigator.activeIndex);
			return true;
		}

		return false;
	}

	resolveMovement(keyName) {
		const movements = {
			ArrowDown: () => this.navigator.move(1),
			ArrowUp: () => this.navigator.move(-1),
			Home: () => this.navigator.first(),
			End: () => this.navigator.last()
		};

		return movements[keyName] ?? null;
	}
}
