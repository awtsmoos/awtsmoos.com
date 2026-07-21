// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarDragController.js
 * @description Resolves library, slot, and removal drags through deterministic store transitions.
 */

export class ActionBarDragController {
	constructor(options) {
		this.store = options.store;
		this.bus = options.bus || null;
		this.drag = null;
	}

	beginAbility(abilityId) {
		this.drag = { abilityId, source: 'library', sourceSlot: null };
		return this.publish('started');
	}

	beginSlot(slotIndex) {
		const abilityId = this.store.snapshot().slots[slotIndex];
		if (!abilityId) return this.result(false, 'empty-source');
		this.drag = { abilityId, source: 'slot', sourceSlot: slotIndex };
		return this.publish('started');
	}

	dropOnSlot(slotIndex) {
		if (!this.drag) return this.result(false, 'not-dragging');
		const result = this.drag.source === 'slot'
			? this.store.move(this.drag.sourceSlot, slotIndex)
			: this.store.assign(slotIndex, this.drag.abilityId);
		if (result.ok) this.finish('dropped');
		return result;
	}

	dropOutside() {
		if (!this.drag) return this.result(false, 'not-dragging');
		const result = this.drag.source === 'slot'
			? this.store.remove(this.drag.sourceSlot)
			: this.result(true, 'discarded');
		if (result.ok) this.finish('removed');
		return result;
	}

	cancel() {
		if (!this.drag) return this.result(true, 'unchanged');
		this.finish('cancelled');
		return this.result(true, 'cancelled');
	}

	snapshot() {
		return this.drag ? { ...this.drag, active: true } : { active: false };
	}

	destroy() {
		this.drag = null;
	}

	finish(reason) {
		this.drag = null;
		this.publish(reason);
	}

	publish(reason) {
		const detail = { ...this.snapshot(), reason };
		this.bus?.emit('actionbar:drag', detail);
		return this.result(true, reason);
	}

	result(ok, reason) {
		return { ok, reason, state: this.snapshot() };
	}
}
