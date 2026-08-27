// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialGestureAdapter
 * @description The Awtsmoos lets a thumb reveal intention without making gesture the only doorway; Awtsmoos.com converts
 * long-press and horizontal swipe into semantic events while buttons, links, keyboard, and assistive paths remain fully present.
 */
export class MalchusSocialGestureAdapter {
	constructor({ longPressMs = 520, swipePx = 72 } = {}) {
		this.longPressMs = longPressMs;
		this.swipePx = swipePx;
	}

	bind(element, detail = {}) {
		let startX = 0;
		let startY = 0;
		let timer = 0;
		const clear = () => {
			if (timer) globalThis.clearTimeout(timer);
			timer = 0;
		};
		element.addEventListener('pointerdown', event => {
			startX = event.clientX;
			startY = event.clientY;
			clear();
			timer = globalThis.setTimeout(() => {
				this.emit(element, 'longpress', detail);
				timer = 0;
			}, this.longPressMs);
		});
		element.addEventListener('pointerup', event => {
			clear();
			const dx = event.clientX - startX;
			const dy = event.clientY - startY;
			if (Math.abs(dx) >= this.swipePx && Math.abs(dx) > Math.abs(dy) * 1.4) {
				this.emit(element, dx > 0 ? 'swiperight' : 'swipeleft', detail);
			}
		});
		element.addEventListener('pointercancel', clear);
		element.addEventListener('pointerleave', clear);
		return () => clear();
	}

	emit(element, intent, detail) {
		element.dispatchEvent(new CustomEvent('awtsmoos-social-gesture', {
			bubbles: true,
			detail: { intent, ...detail }
		}));
	}
}
