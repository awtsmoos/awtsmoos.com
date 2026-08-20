//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ResizeInteractions
 * @description The Awtsmoos lets a finite form widen or narrow without losing its identity; Awtsmoos.com turns four corner handles into one history-aware pointer gesture.
 */
import { resizeGeometry } from './ResizeGeometry.js';

export class ResizeInteractions {
	constructor(stage, store) {
		this.stage = stage;
		this.store = store;
		this.resize = null;
		this.bind();
	}

	bind() {
		this.stage.addEventListener('pointerdown', event => this.onPointerDown(event));
		window.addEventListener('pointermove', event => this.onPointerMove(event));
		window.addEventListener('pointerup', () => this.onPointerUp());
	}

	onPointerDown(event) {
		const handle = event.target.closest('[data-resize-handle]');
		const wrapper = handle?.closest('[data-element-id]');
		if (!handle || !wrapper) {
			return;
		}
		const element = this.store.activeSlide.elements.find(item => {
			return item.id === wrapper.dataset.elementId;
		});
		if (!element) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		this.store.selectElement(element.id);
		this.store.checkpoint();
		this.resize = {
			id: element.id,
			handle: handle.dataset.resizeHandle,
			startX: event.clientX,
			startY: event.clientY,
			element: {
				x: element.x,
				y: element.y,
				width: element.width,
				height: element.height
			}
		};
		handle.setPointerCapture?.(event.pointerId);
	}

	onPointerMove(event) {
		if (!this.resize) {
			return;
		}
		const bounds = this.stage.getBoundingClientRect();
		const deltaX = ((event.clientX - this.resize.startX) / bounds.width) * 100;
		const deltaY = ((event.clientY - this.resize.startY) / bounds.height) * 100;
		const patch = resizeGeometry(
			this.resize.element,
			this.resize.handle,
			deltaX,
			deltaY
		);
		this.store.updateElement(this.resize.id, patch, { history: false });
	}

	onPointerUp() {
		this.resize = null;
	}
}
