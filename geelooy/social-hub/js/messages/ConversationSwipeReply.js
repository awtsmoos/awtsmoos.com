//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ConversationSwipeReply
 * @description
 * The Awtsmoos is beyond gesture and stillness, while Awtsmoos.com lets a deliberate horizontal pull reveal the same Reply doorway already available by button;
 * this Gevurah-like adapter protects vertical scroll, RTL direction, audio, links, and form controls so touch motion stays an enhancement instead of a trap in light.
 */
export class ConversationSwipeReply {
	constructor(onReply) {
		this.onReply = onReply;
		this.bindings = new Map();
	}

	/** Installs one bounded pointer gesture on a canonical message card. */
	install(card, message) {
		if (!card || this.bindings.has(card)) return;
		const state = this.state();
		const down = event => this.start(event, card, state);
		const move = event => this.move(event, card, state);
		const end = event => this.end(event, card, message, state);
		card.addEventListener('pointerdown', down);
		card.addEventListener('pointermove', move);
		card.addEventListener('pointerup', end);
		card.addEventListener('pointercancel', end);
		this.bindings.set(card, { down, move, end });
	}

	/** Releases all installed listeners when a room closes or rerenders. */
	clear() {
		for (const [card, listeners] of this.bindings) {
			card.removeEventListener('pointerdown', listeners.down);
			card.removeEventListener('pointermove', listeners.move);
			card.removeEventListener('pointerup', listeners.end);
			card.removeEventListener('pointercancel', listeners.end);
			card.style.removeProperty('--reply-swipe-x');
			delete card.dataset.replySwiping;
		}
		this.bindings.clear();
	}

	state() {
		return {
			pointerId: null,
			startX: 0,
			startY: 0,
			locked: '',
			distance: 0
		};
	}

	start(event, card, state) {
		if (!event.isPrimary || event.button !== 0 || this.isInteractive(event.target)) return;
		state.pointerId = event.pointerId;
		state.startX = event.clientX;
		state.startY = event.clientY;
		state.locked = '';
		state.distance = 0;
		card.setPointerCapture?.(event.pointerId);
	}

	move(event, card, state) {
		if (state.pointerId !== event.pointerId) return;
		const dx = event.clientX - state.startX;
		const dy = event.clientY - state.startY;
		if (!state.locked && Math.max(Math.abs(dx), Math.abs(dy)) >= 9) {
			state.locked = Math.abs(dx) > Math.abs(dy) * 1.15 ? 'x' : 'y';
		}
		if (state.locked !== 'x') return;
		const direction = getComputedStyle(card).direction === 'rtl' ? -1 : 1;
		const forward = Math.max(0, dx * direction);
		state.distance = Math.min(78, Math.sqrt(forward) * 8.6);
		card.dataset.replySwiping = 'true';
		card.style.setProperty('--reply-swipe-x', `${state.distance * direction}px`);
		event.preventDefault();
	}

	end(event, card, message, state) {
		if (state.pointerId !== event.pointerId) return;
		const shouldReply = state.locked === 'x' && state.distance >= 58;
		state.pointerId = null;
		state.locked = '';
		state.distance = 0;
		card.style.setProperty('--reply-swipe-x', '0px');
		delete card.dataset.replySwiping;
		if (shouldReply) this.onReply?.(message);
	}

	isInteractive(target) {
		return Boolean(target?.closest?.(
			'button, a, audio, input, textarea, select, label, [data-no-swipe]'
		));
	}
}
