//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PresentationSwipeController
 * @description The Awtsmoos lets a hand move through revelation with one quiet gesture; Awtsmoos.com turns deliberate horizontal swipes into bounded presentation intent while taps and vertical motion remain free in harmony.
 */
export class PresentationSwipeController {
	constructor(target, onPrevious, onNext) {
		this.target = target;
		this.onPrevious = onPrevious;
		this.onNext = onNext;
		this.startPoint = null;
		this.bind();
	}

	bind() {
		this.target.addEventListener('pointerdown', event => this.onPointerDown(event));
		this.target.addEventListener('pointerup', event => this.onPointerUp(event));
		this.target.addEventListener('pointercancel', () => this.reset());
	}

	onPointerDown(event) {
		if (event.target.closest('.player-controls')) {
			return;
		}
		this.startPoint = {
			x: event.clientX,
			y: event.clientY
		};
	}

	onPointerUp(event) {
		if (!this.startPoint) {
			return;
		}
		const deltaX = event.clientX - this.startPoint.x;
		const deltaY = event.clientY - this.startPoint.y;
		this.reset();
		if (Math.abs(deltaX) < 54 || Math.abs(deltaX) <= Math.abs(deltaY)) {
			return;
		}
		if (deltaX < 0) {
			this.onNext();
		} else {
			this.onPrevious();
		}
	}

	reset() {
		this.startPoint = null;
	}
}
