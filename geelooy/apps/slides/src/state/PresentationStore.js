//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PresentationStore
 * @description The Awtsmoos renews slide-level action above focused element mutation; Awtsmoos.com keeps lifecycle, ordering, targeted slide updates, and history readable while each lower vessel carries its own responsibility.
 */
import {
	clonePresentation,
	createSlide
} from '../model/PresentationDocument.js';
import { ElementMutationStore } from './ElementMutationStore.js';

export class PresentationStore extends ElementMutationStore {
	addSlide() {
		const slide = createSlide(`Slide ${this.document.slides.length + 1}`);
		this.commit('add-slide', draft => {
			draft.slides.push(slide);
		});
		this.selectSlide(slide.id);
	}

	duplicateSlide() {
		const source = clonePresentation({
			slides: [this.activeSlide]
		}).slides[0];
		source.id = createSlideId();
		source.name = `${source.name} copy`;
		this.commit('duplicate-slide', draft => {
			draft.slides.splice(this.activeSlideIndex + 1, 0, source);
		});
		this.selectSlide(source.id);
	}

	deleteSlide() {
		if (this.document.slides.length === 1) {
			return;
		}
		const index = this.activeSlideIndex;
		this.commit('delete-slide', draft => {
			draft.slides.splice(index, 1);
		});
		const nextIndex = Math.min(index, this.document.slides.length - 1);
		this.activeSlideId = this.document.slides[nextIndex].id;
		this.selectedElementId = null;
		this.emit('select-slide');
	}

	moveSlide(slideId, targetIndex) {
		const sourceIndex = this.document.slides.findIndex(slide => slide.id === slideId);
		const boundedTarget = Math.max(
			0,
			Math.min(this.document.slides.length - 1, Number(targetIndex) || 0)
		);
		if (sourceIndex < 0 || sourceIndex === boundedTarget) {
			return false;
		}
		this.commit('reorder-slide', draft => {
			const [slide] = draft.slides.splice(sourceIndex, 1);
			draft.slides.splice(boundedTarget, 0, slide);
		});
		return true;
	}

	moveActiveSlide(direction) {
		const offset = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
		if (!offset) {
			return false;
		}
		return this.moveSlide(this.activeSlideId, this.activeSlideIndex + offset);
	}

	updateSlide(patch) {
		return this.updateSlideById(this.activeSlideId, patch);
	}

	updateSlideById(slideId, patch) {
		const exists = this.document.slides.some(slide => slide.id === slideId);
		if (!exists) {
			return false;
		}
		this.commit('update-slide', draft => {
			const slide = draft.slides.find(item => item.id === slideId);
			if (slide) {
				Object.assign(slide, patch);
			}
		});
		return true;
	}

	undo() {
		const previous = this.history.undo(this.document);
		if (previous) {
			this.replaceDocument(previous, 'undo');
		}
	}

	redo() {
		const next = this.history.redo(this.document);
		if (next) {
			this.replaceDocument(next, 'redo');
		}
	}
}

function createSlideId() {
	const time = Date.now().toString(36);
	const random = Math.random().toString(36).slice(2, 7);
	return `slide-${time}-${random}`;
}
