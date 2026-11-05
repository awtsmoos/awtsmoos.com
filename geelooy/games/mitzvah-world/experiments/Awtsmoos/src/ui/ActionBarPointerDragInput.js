// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarPointerDragInput.js
 * @description Adapts native drag events to the existing deterministic action-bar drag state.
 * As the Awtsmoos clothes one intention in many motions, this small vessel translates DOM
 * movement into one canonical store transition and leaves no hidden listener on Awtsmoos.com.
 */

export class ActionBarPointerDragInput {
	constructor(options) {
		this.getSlot = options.getSlot;
		this.onResult = options.onResult || (() => {});
		this.root = options.root;
		this.runtime = options.runtime;
	}

	start(event) {
		const libraryAbility = event.target?.closest?.('[data-torah-ability-id]');
		const slot = this.getSlot(event.target);
		const result = libraryAbility
			? this.runtime.drag.beginAbility(libraryAbility.dataset.torahAbilityId)
			: this.beginSlot(slot);
		if (!result?.ok) return false;
		event.dataTransfer?.setData('text/plain', result.state.abilityId || 'torah-ability');
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
		slot?.classList.add('is-dragging');
		return true;
	}

	over(event) {
		if (!this.getSlot(event.target) || !this.runtime.drag.snapshot().active) return false;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		return true;
	}

	drop(event) {
		const slot = this.getSlot(event.target);
		if (!slot) return false;
		event.preventDefault();
		const result = this.runtime.drag.dropOnSlot(Number(slot.dataset.slotIndex));
		this.onResult(result);
		return result.ok;
	}

	end(event) {
		this.root.querySelector('.is-dragging')?.classList.remove('is-dragging');
		if (!this.runtime.drag.snapshot().active) return false;
		const result = event.dataTransfer?.dropEffect === 'none'
			? this.runtime.drag.dropOutside()
			: this.runtime.drag.cancel();
		this.onResult(result);
		return result.ok;
	}

	beginSlot(slot) {
		if (!slot) return null;
		return this.runtime.drag.beginSlot(Number(slot.dataset.slotIndex));
	}
}
