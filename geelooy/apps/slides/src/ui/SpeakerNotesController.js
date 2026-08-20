//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class SpeakerNotesController
 * @description The Awtsmoos lets hidden words remain faithful to the slide that received them; Awtsmoos.com binds every delayed note to its original vessel and flushes it before focus or lifecycle can carry the hand elsewhere.
 */
export class SpeakerNotesController {
	constructor(root, store) {
		this.root = root;
		this.store = store;
		this.textarea = root.querySelector('[data-speaker-notes]');
		this.activeSlideId = store.activeSlideId;
		this.pendingSlideId = null;
		this.pendingValue = '';
		this.timer = null;
		this.bind();
		this.unsubscribe = this.store.subscribe(snapshot => this.render(snapshot));
	}

	bind() {
		this.textarea?.addEventListener('input', () => this.scheduleCommit());
		this.textarea?.addEventListener('blur', () => this.flushPending());
		window.addEventListener('pagehide', () => this.flushPending());
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'hidden') {
				this.flushPending();
			}
		});
	}

	render(snapshot) {
		const nextSlideId = snapshot.activeSlide?.id || null;
		const slideChanged = nextSlideId !== this.activeSlideId;
		if (slideChanged) {
			this.activeSlideId = nextSlideId;
			this.flushPending();
		}
		if (!this.textarea) {
			return;
		}
		if (!slideChanged && document.activeElement === this.textarea) {
			return;
		}
		this.textarea.value = snapshot.activeSlide?.notes || '';
	}

	scheduleCommit() {
		if (!this.textarea || !this.activeSlideId) {
			return;
		}
		this.pendingSlideId = this.activeSlideId;
		this.pendingValue = this.textarea.value.slice(0, 50000);
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.flushPending(), 240);
	}

	flushPending() {
		clearTimeout(this.timer);
		this.timer = null;
		if (!this.pendingSlideId) {
			return false;
		}
		const slideId = this.pendingSlideId;
		const notes = this.pendingValue;
		this.pendingSlideId = null;
		this.pendingValue = '';
		return this.store.updateSlideById(slideId, { notes });
	}
}
