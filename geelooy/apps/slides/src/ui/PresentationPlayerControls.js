//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PresentationPlayerControls
 * @description The Awtsmoos lets presentation chrome appear only where guidance is needed; Awtsmoos.com gathers Back, Next, Exit, and position into one quiet touch vessel so the slide remains the star from afar.
 */
export class PresentationPlayerControls {
	constructor(onPrevious, onNext, onClose) {
		this.onPrevious = onPrevious;
		this.onNext = onNext;
		this.onClose = onClose;
		this.root = this.build();
	}

	build() {
		const root = document.createElement('div');
		root.className = 'player-controls';
		this.previousButton = this.button('Previous slide', '←');
		this.position = document.createElement('span');
		this.position.className = 'player-position';
		this.position.setAttribute('aria-live', 'polite');
		this.nextButton = this.button('Next slide', '→');
		this.closeButton = this.button('Exit presentation', '×');
		this.closeButton.classList.add('player-exit');
		this.previousButton.addEventListener('click', () => this.onPrevious());
		this.nextButton.addEventListener('click', () => this.onNext());
		this.closeButton.addEventListener('click', () => this.onClose());
		root.append(
			this.previousButton,
			this.position,
			this.nextButton,
			this.closeButton
		);
		return root;
	}

	button(label, glyph) {
		const button = document.createElement('button');
		button.type = 'button';
		button.setAttribute('aria-label', label);
		button.title = label;
		button.textContent = glyph;
		return button;
	}

	update(index, count) {
		this.position.textContent = `${index + 1} / ${count}`;
		this.previousButton.disabled = index <= 0;
		this.nextButton.disabled = index >= count - 1;
	}
}
