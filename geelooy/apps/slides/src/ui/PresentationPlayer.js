//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PresentationPlayer
 * @description The Awtsmoos lets authoring become revelation while guidance stays light; Awtsmoos.com joins keyboard, swipe, and touch controls around one bounded playback law so every screen may present in delight.
 */
import { renderPassiveSlide } from '../render/SlideRenderer.js';
import {
	movePresentationIndex,
	presentationPosition
} from './PresentationNavigation.js';
import { PresentationPlayerControls } from './PresentationPlayerControls.js';
import { PresentationSwipeController } from './PresentationSwipeController.js';

export class PresentationPlayer {
	constructor(overlay, store) {
		this.overlay = overlay;
		this.store = store;
		this.index = 0;
		this.keyHandler = event => this.onKey(event);
		this.build();
	}

	build() {
		this.stage = document.createElement('div');
		this.stage.className = 'player-stage';
		this.controls = new PresentationPlayerControls(
			() => this.previous(),
			() => this.next(),
			() => this.close()
		);
		this.overlay.replaceChildren(this.stage, this.controls.root);
		new PresentationSwipeController(
			this.overlay,
			() => this.previous(),
			() => this.next()
		);
	}

	open() {
		this.index = this.store.activeSlideIndex;
		this.overlay.hidden = false;
		this.overlay.setAttribute('aria-hidden', 'false');
		document.documentElement.classList.add('is-presenting');
		document.addEventListener('keydown', this.keyHandler);
		this.render();
		this.controls.closeButton.focus({ preventScroll: true });
	}

	close() {
		this.overlay.hidden = true;
		this.overlay.setAttribute('aria-hidden', 'true');
		document.documentElement.classList.remove('is-presenting');
		document.removeEventListener('keydown', this.keyHandler);
	}

	render() {
		const slides = this.store.document.slides;
		const slide = slides[this.index];
		if (!slide) {
			return;
		}
		renderPassiveSlide(this.stage, slide);
		this.controls.update(this.index, slides.length);
		this.controls.position.textContent = presentationPosition(
			this.index,
			slides.length
		);
	}

	move(direction) {
		const slides = this.store.document.slides;
		const nextIndex = movePresentationIndex(
			this.index,
			slides.length,
			direction
		);
		if (nextIndex === this.index) {
			return;
		}
		this.index = nextIndex;
		this.render();
	}

	next() {
		this.move('next');
	}

	previous() {
		this.move('previous');
	}

	onKey(event) {
		if (event.key === 'Escape') {
			this.close();
			return;
		}
		if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(event.key)) {
			event.preventDefault();
			this.next();
			return;
		}
		if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
			event.preventDefault();
			this.previous();
		}
	}
}
