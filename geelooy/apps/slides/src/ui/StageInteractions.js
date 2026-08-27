//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class StageInteractions
 * @description The Awtsmoos renews intention into motion; Awtsmoos.com keeps selection, snapped dragging, safe pointer capture, and cancellation cleanup in one focused vessel while text editing, resize, and keyboard laws breathe elsewhere.
 */
import { snapGeometry } from './SnapGeometry.js';

export class StageInteractions {
	constructor(stage, store) {
		this.stage = stage;
		this.store = store;
		this.drag = null;
		this.bind();
	}

	bind() {
		this.stage.addEventListener('pointerdown', event => this.onPointerDown(event));
		window.addEventListener('pointermove', event => this.onPointerMove(event));
		window.addEventListener('pointerup', () => this.endDrag());
		window.addEventListener('pointercancel', () => this.endDrag());
		window.addEventListener('blur', () => this.endDrag());
	}

	onPointerDown(event) {
		if (event.target.closest('[data-resize-handle]')) {
			return;
		}
		const node = event.target.closest('[data-element-id]');
		if (!node) {
			this.store.selectElement(null);
			return;
		}
		const element = this.store.activeSlide.elements.find(item => {
			return item.id === node.dataset.elementId;
		});
		if (!element || event.target.isContentEditable) {
			return;
		}
		this.store.selectElement(element.id);
		this.store.checkpoint();
		this.drag = {
			id: element.id,
			startX: event.clientX,
			startY: event.clientY,
			x: element.x,
			y: element.y,
			width: element.width,
			height: element.height
		};
		capturePointerSafely(node, event.pointerId);
		node.classList.add('is-dragging');
	}

	onPointerMove(event) {
		if (!this.drag) {
			return;
		}
		const bounds = this.stage.getBoundingClientRect();
		const proposed = {
			x: this.drag.x + ((event.clientX - this.drag.startX) / bounds.width) * 100,
			y: this.drag.y + ((event.clientY - this.drag.startY) / bounds.height) * 100
		};
		const peers = this.store.activeSlide.elements.filter(element => {
			return element.id !== this.drag.id;
		});
		const snapped = snapGeometry(this.drag, proposed, peers);
		this.store.updateElement(this.drag.id, {
			x: clamp(snapped.x),
			y: clamp(snapped.y)
		}, { history: false });
		this.emitGuides(snapped.guides);
	}

	endDrag() {
		if (!this.drag) {
			this.emitGuides({ x: null, y: null });
			return;
		}
		this.drag = null;
		this.stage.querySelector('.is-dragging')?.classList.remove('is-dragging');
		this.emitGuides({ x: null, y: null });
	}

	emitGuides(guides) {
		this.stage.dispatchEvent(new CustomEvent('BH_SLIDES_SNAP_GUIDES', {
			detail: guides
		}));
	}
}

function capturePointerSafely(node, pointerId) {
	try {
		node.setPointerCapture?.(pointerId);
	} catch (error) {
		if (error?.name !== 'NotFoundError') {
			throw error;
		}
	}
}

function clamp(value) {
	return Math.max(-10, Math.min(100, value));
}
