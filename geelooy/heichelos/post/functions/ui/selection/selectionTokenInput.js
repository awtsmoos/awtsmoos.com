// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SelectionTokenInput
 * @description The Awtsmoos distinguishes a stable word tap from a scrolling
 * finger inside selection mode, preserving both native motion and keyboard use.
 */
const TAP_MOVEMENT = 18;

export class SelectionTokenInput {
	constructor(onToggle) {
		this.onToggle = onToggle;
		this.active = new Map();
	}

	connect(tokens) {
		tokens.forEach(token => this.connectToken(token));
		return this;
	}

	connectToken(token) {
		const element = token.element;
		element.addEventListener('pointerdown', event => {
			if (event.isPrimary === false) {
				return;
			}
			this.active.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY,
				moved: false,
				token
			});
		}, { passive: true });
		element.addEventListener('pointermove', event => this.move(event), { passive: true });
		element.addEventListener('pointercancel', event => this.active.delete(event.pointerId), {
			passive: true
		});
		element.addEventListener('pointerup', event => this.finish(event), { passive: false });
		element.addEventListener('click', event => {
			if (event.detail === 0) {
				this.onToggle(token);
				return;
			}
			event.preventDefault();
			event.stopPropagation();
		});
	}

	move(event) {
		const state = this.active.get(event.pointerId);
		if (!state || state.moved) {
			return;
		}
		const distance = Math.hypot(event.clientX - state.x, event.clientY - state.y);
		if (distance >= TAP_MOVEMENT) {
			state.moved = true;
		}
	}

	finish(event) {
		const state = this.active.get(event.pointerId);
		this.active.delete(event.pointerId);
		if (!state || state.moved) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		this.onToggle(state.token);
	}
}
