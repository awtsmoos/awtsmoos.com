// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarStore.js
 * @description Owns a bounded, persistent-ready Torah ability layout without frame work or DOM state.
 */

const SLOTS_PER_ROW = 12;
const MAXIMUM_ROWS = 2;
const MAXIMUM_SLOTS = SLOTS_PER_ROW * MAXIMUM_ROWS;

export class ActionBarStore {
	constructor(options = {}) {
		this.activateAbility = options.activateAbility || (() => ({ ok: false, reason: 'unavailable' }));
		this.isAbilityKnown = options.isAbilityKnown || (() => true);
		this.listeners = new Set();
		this.locked = Boolean(options.locked);
		this.rows = options.rows === MAXIMUM_ROWS ? MAXIMUM_ROWS : 1;
		this.slots = Array(MAXIMUM_SLOTS).fill(null);
		this.revision = 0;
		if (options.layout) this.restore(options.layout, false);
	}

	onChange(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	assign(slotIndex, abilityId) {
		if (!this.canEdit()) return this.result(false, 'layout-locked');
		this.assertVisibleSlot(slotIndex);
		if (!this.validAbility(abilityId)) return this.result(false, 'unknown-ability');
		if (this.slots[slotIndex] === abilityId) return this.result(true, 'unchanged');
		this.slots[slotIndex] = abilityId;
		return this.publish('assigned');
	}

	move(sourceIndex, targetIndex) {
		if (!this.canEdit()) return this.result(false, 'layout-locked');
		this.assertVisibleSlot(sourceIndex);
		this.assertVisibleSlot(targetIndex);
		if (sourceIndex === targetIndex) return this.result(true, 'unchanged');
		const sourceAbility = this.slots[sourceIndex];
		if (!sourceAbility) return this.result(false, 'empty-source');
		[this.slots[sourceIndex], this.slots[targetIndex]] = [this.slots[targetIndex], sourceAbility];
		return this.publish('moved');
	}

	remove(slotIndex) {
		if (!this.canEdit()) return this.result(false, 'layout-locked');
		this.assertVisibleSlot(slotIndex);
		if (!this.slots[slotIndex]) return this.result(true, 'unchanged');
		this.slots[slotIndex] = null;
		return this.publish('removed');
	}

	activate(slotIndex, context = {}) {
		this.assertVisibleSlot(slotIndex);
		const abilityId = this.slots[slotIndex];
		if (!abilityId) return this.result(false, 'empty-slot');
		return this.activateAbility(abilityId, { ...context, slotIndex });
	}

	setLocked(locked) {
		const next = Boolean(locked);
		if (this.locked === next) return this.result(true, 'unchanged');
		this.locked = next;
		return this.publish(next ? 'locked' : 'unlocked');
	}

	setRows(rows) {
		const next = rows === MAXIMUM_ROWS ? MAXIMUM_ROWS : 1;
		if (this.rows === next) return this.result(true, 'unchanged');
		this.rows = next;
		return this.publish('rows-changed');
	}

	restore(layout, publish = true) {
		this.locked = Boolean(layout?.locked);
		this.rows = layout?.rows === MAXIMUM_ROWS ? MAXIMUM_ROWS : 1;
		for (let index = 0; index < MAXIMUM_SLOTS; index += 1) {
			const abilityId = layout?.slots?.[index];
			this.slots[index] = this.validAbility(abilityId) ? abilityId : null;
		}
		return publish ? this.publish('restored') : this.snapshot();
	}

	snapshot() {
		return {
			locked: this.locked,
			revision: this.revision,
			rows: this.rows,
			slots: [...this.slots],
			version: 1
		};
	}

	destroy() {
		this.listeners.clear();
	}

	canEdit() {
		return !this.locked;
	}

	validAbility(abilityId) {
		return typeof abilityId === 'string' && abilityId.length > 0 && this.isAbilityKnown(abilityId);
	}

	assertVisibleSlot(slotIndex) {
		if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= this.rows * SLOTS_PER_ROW) {
			throw new RangeError(`Action slot ${slotIndex} is outside the visible layout.`);
		}
	}

	publish(reason) {
		this.revision += 1;
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot, reason);
		return this.result(true, reason, snapshot);
	}

	result(ok, reason, snapshot = this.snapshot()) {
		return { ok, reason, snapshot };
	}
}

export const ACTION_BAR_LIMITS = Object.freeze({ maximumRows: MAXIMUM_ROWS, slotsPerRow: SLOTS_PER_ROW });
