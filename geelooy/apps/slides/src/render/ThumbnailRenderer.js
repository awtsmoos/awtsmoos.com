//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ThumbnailRenderer
 * @description The Awtsmoos lets the whole deck be glimpsed through small windows; Awtsmoos.com keeps each thumbnail a generous tap target while permitting desktop drag-ordering without changing its selection law.
 */
import { renderPassiveSlide } from './SlideRenderer.js';

export class ThumbnailRenderer {
	constructor(container, store) {
		this.container = container;
		this.store = store;
		this.container.addEventListener('click', event => this.handleClick(event));
	}

	render(snapshot) {
		this.container.replaceChildren();
		snapshot.document.slides.forEach((slide, index) => {
			this.container.append(
				this.createCard(slide, index, snapshot.activeSlide.id)
			);
		});
	}

	createCard(slide, index, activeId) {
		const button = document.createElement('button');
		button.className = `thumbnail-card${slide.id === activeId ? ' is-active' : ''}`;
		button.dataset.slideId = slide.id;
		button.draggable = true;
		button.setAttribute('aria-label', `Open slide ${index + 1}: ${slide.name}`);
		const number = document.createElement('span');
		number.textContent = String(index + 1);
		const preview = document.createElement('span');
		preview.className = 'thumbnail-preview';
		renderPassiveSlide(preview, slide);
		button.append(number, preview);
		return button;
	}

	handleClick(event) {
		const button = event.target.closest('[data-slide-id]');
		if (button) {
			this.store.selectSlide(button.dataset.slideId);
		}
	}
}
