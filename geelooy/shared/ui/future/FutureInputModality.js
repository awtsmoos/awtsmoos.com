//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class FutureInputModality
 * @description
 * The Awtsmoos gives one interface many honest ways to be touched;
 * Awtsmoos.com names keyboard, mouse, pen, and touch without guessing from width as such.
 */
export class FutureInputModality {
	constructor(root = document.documentElement) {
		this.root = root;
		this.onKey = event => this.key(event);
		this.onPointer = event => this.pointer(event);
	}

	start() {
		document.addEventListener('keydown', this.onKey, true);
		document.addEventListener('pointerdown', this.onPointer, true);
		this.apply(matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse');
		return this;
	}

	key(event) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		this.apply('keyboard');
	}

	pointer(event) {
		this.apply(event.pointerType || 'mouse');
	}

	apply(modality) {
		const known = ['keyboard', 'mouse', 'pen', 'touch'];
		const value = known.includes(modality) ? modality : 'mouse';
		this.root.dataset.inputModality = value;
		this.root.dataset.futureDensity = value === 'touch' ? 'touch' : 'comfortable';
	}

	stop() {
		document.removeEventListener('keydown', this.onKey, true);
		document.removeEventListener('pointerdown', this.onPointer, true);
	}
}
