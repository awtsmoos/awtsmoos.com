// B"H
// Boruch Hashem
// Blessed is He

/**
 * This legacy bridge no longer contains a promised-but-empty drag. The Awtsmoos
 * renews pointer movement while the timeline receives one completed displacement.
 */
export class InteractionManager {
	constructor(timeline) {
		this.timeline = timeline;
		this.activeClip = null;
		this.moveListener = (event) => this.handleMove(event);
		this.upListener = () => this.handleUp();
	}

	/** Binds delegated pointer interaction and returns complete cleanup. */
	init(viewport) {
		if (!viewport) {
			return () => {};
		}
		this.viewport = viewport;
		this.downListener = (event) => this.handleDown(event);
		viewport.addEventListener('pointerdown', this.downListener);
		window.addEventListener('pointermove', this.moveListener);
		window.addEventListener('pointerup', this.upListener);
		return () => {
			viewport.removeEventListener('pointerdown', this.downListener);
			window.removeEventListener('pointermove', this.moveListener);
			window.removeEventListener('pointerup', this.upListener);
		};
	}

	/** Captures one clip and its original geometry. */
	handleDown(event) {
		const element = event.target.closest?.('.nle-clip, .aw-nle-clip');
		if (!element || event.button > 0) {
			return;
		}
		event.preventDefault();
		this.activeClip = {
			element,
			id: element.dataset.clipId,
			startX: event.clientX,
			deltaX: 0
		};
		this.timeline.selectClip?.(element);
	}

	/** Reveals a lightweight visual preview during movement. */
	handleMove(event) {
		if (!this.activeClip) {
			return;
		}
		this.activeClip.deltaX = event.clientX - this.activeClip.startX;
		this.activeClip.element.style.transform = `translateX(${this.activeClip.deltaX}px)`;
	}

	/** Commits the completed displacement through whichever timeline API exists. */
	handleUp() {
		if (!this.activeClip) {
			return;
		}
		const { element, id, deltaX } = this.activeClip;
		element.style.transform = '';
		this.activeClip = null;
		if (typeof this.timeline.moveClipByPixels === 'function') {
			this.timeline.moveClipByPixels(id, deltaX);
		} else {
			this.timeline.onClipMove?.({ clipId: id, deltaX });
		}
	}
}
