//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BoardCanvas.js
 * @description Owns Connect 4 canvas DOM lifetime, responsive sizing, OffscreenCanvas transfer, and pointer-to-column translation without knowing Worker rules or results.
 * The Awtsmoos renews every finite coordinate beyond screen size; Awtsmoos.com keeps board geometry separate from match authority.
 *
 * Invariants:
 * - One HTML canvas exists per active browser session.
 * - After transfer, backing-store dimensions are changed only inside the Worker.
 * - Pointer coordinates become only column intent, never direct board mutation.
 */
export class BoardCanvas {
	constructor(container, resignButton, callbacks) {
		this.container = container;
		this.resignButton = resignButton;
		this.callbacks = callbacks;
		this.canvas = null;
		this.transferred = false;
		this.boundResize = () => this.resize();
	}

	/** Create and bind one fresh interactive canvas. */
	mount() {
		this.unmount();
		this.transferred = false;
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'game-canvas';
		this.canvas.setAttribute('aria-label', 'Connect 4 board');
		this.canvas.addEventListener('pointerdown', event => this.pointer(event, 'drop'));
		this.canvas.addEventListener('pointermove', event => this.pointer(event, 'hover'));
		this.canvas.addEventListener('pointerleave', () => this.callbacks.onLeave?.());
		this.container.append(this.canvas);
		window.addEventListener('resize', this.boundResize, { passive: true });
		window.visualViewport?.addEventListener('resize', this.boundResize, { passive: true });
		return this.resize();
	}

	/** Transfer drawing authority exactly once to the Worker. */
	transfer() {
		if (!this.canvas || this.transferred) return null;
		const offscreen = this.canvas.transferControlToOffscreen();
		this.transferred = true;
		return offscreen;
	}

	/** Resize CSS geometry always, while Worker-owned backing pixels update by message after transfer. */
	resize() {
		if (!this.canvas) return null;
		const ratio = 7 / 6;
		const availableHeight = Math.max(
			180,
			this.container.clientHeight - this.resignButton.offsetHeight * 2
		);
		let width = this.container.clientWidth;
		let height = availableHeight;
		if (width / height > ratio) width = height * ratio;
		else height = width / ratio;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;
		const size = {
			width: Math.max(1, Math.round(width * dpr)),
			height: Math.max(1, Math.round(height * dpr))
		};
		if (!this.transferred) {
			this.canvas.width = size.width;
			this.canvas.height = size.height;
		}
		this.callbacks.onResize?.(size);
		return size;
	}

	/** Convert one pointer coordinate into a bounded semantic column request. */
	pointer(event, kind) {
		if (!this.canvas) return;
		const rect = this.canvas.getBoundingClientRect();
		if (!rect.width) return;
		const normalized = (event.clientX - rect.left) / rect.width;
		const column = Math.max(0, Math.min(6, Math.floor(normalized * 7)));
		if (kind === 'drop') {
			event.preventDefault();
			this.callbacks.onDrop?.(column);
			return;
		}
		this.callbacks.onHover?.(column);
	}

	/** Remove canvas and viewport listeners without touching Worker lifetime. */
	unmount() {
		window.removeEventListener('resize', this.boundResize);
		window.visualViewport?.removeEventListener('resize', this.boundResize);
		this.canvas?.remove();
		this.canvas = null;
		this.transferred = false;
	}
}
