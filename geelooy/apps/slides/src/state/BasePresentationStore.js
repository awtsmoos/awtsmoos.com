//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class BasePresentationStore
 * @description The Awtsmoos renews one canonical document beneath every visible edit; Awtsmoos.com keeps history, subscriptions, selection, and immutable-style commits in one foundational vessel.
 */
import {
	clonePresentation,
	createPresentation,
	normalizePresentation
} from '../model/PresentationDocument.js';
import { HistoryStack } from './HistoryStack.js';

export class BasePresentationStore {
	constructor(initialDocument = createPresentation()) {
		this.document = normalizePresentation(initialDocument);
		this.activeSlideId = this.document.slides[0].id;
		this.selectedElementId = null;
		this.history = new HistoryStack();
		this.listeners = new Set();
	}

	get activeSlide() {
		return this.document.slides.find(slide => slide.id === this.activeSlideId)
			|| this.document.slides[0];
	}

	get selectedElement() {
		return this.activeSlide?.elements.find(element => element.id === this.selectedElementId)
			|| null;
	}

	get activeSlideIndex() {
		return Math.max(
			0,
			this.document.slides.findIndex(slide => slide.id === this.activeSlideId)
		);
	}

	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot('initial'));
		return () => this.listeners.delete(listener);
	}

	snapshot(reason = 'change') {
		return {
			reason,
			document: this.document,
			activeSlide: this.activeSlide,
			selectedElement: this.selectedElement
		};
	}

	emit(reason) {
		for (const listener of this.listeners) {
			listener(this.snapshot(reason));
		}
	}

	checkpoint() {
		this.history.push(this.document);
	}

	commit(reason, mutator, { history = true } = {}) {
		if (history) {
			this.history.push(this.document);
		}
		const draft = clonePresentation(this.document);
		mutator(draft);
		draft.revision = this.document.revision + 1;
		this.document = normalizePresentation(draft);
		this.reconcileSelection();
		this.emit(reason);
	}

	replaceDocument(input, reason = 'remote') {
		this.document = normalizePresentation(input);
		const activeStillExists = this.document.slides.some(slide => slide.id === this.activeSlideId);
		this.activeSlideId = activeStillExists
			? this.activeSlideId
			: this.document.slides[0].id;
		this.reconcileSelection();
		this.emit(reason);
	}

	selectSlide(id) {
		if (!this.document.slides.some(slide => slide.id === id)) {
			return;
		}
		this.activeSlideId = id;
		this.selectedElementId = null;
		this.emit('select-slide');
	}

	selectElement(id) {
		this.selectedElementId = id || null;
		this.emit('select-element');
	}

	reconcileSelection() {
		if (this.selectedElementId && !this.selectedElement) {
			this.selectedElementId = null;
		}
	}

	findSlide(document) {
		return document.slides.find(slide => slide.id === this.activeSlideId)
			|| document.slides[0];
	}

	findElement(document, id) {
		return this.findSlide(document)?.elements.find(element => element.id === id)
			|| null;
	}
}
