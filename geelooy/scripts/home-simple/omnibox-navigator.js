// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos moves one active path through a bounded list, letting the input retain focus while intention travels visibly.

export class OmniboxNavigator {
	constructor() {
		this.activeIndex = -1;
		this.optionCount = 0;
	}

	reset(optionCount) {
		this.optionCount = Math.max(0, optionCount);
		this.activeIndex = -1;
		return this.activeIndex;
	}

	move(direction) {
		if (this.optionCount === 0) {
			return this.reset(0);
		}

		if (this.activeIndex < 0) {
			this.activeIndex = direction > 0 ? 0 : this.optionCount - 1;
			return this.activeIndex;
		}

		this.activeIndex = (
			this.activeIndex + direction + this.optionCount
		) % this.optionCount;
		return this.activeIndex;
	}

	first() {
		this.activeIndex = this.optionCount > 0 ? 0 : -1;
		return this.activeIndex;
	}

	last() {
		this.activeIndex = this.optionCount > 0 ? this.optionCount - 1 : -1;
		return this.activeIndex;
	}

	set(index) {
		if (index < 0 || index >= this.optionCount) {
			return this.activeIndex;
		}

		this.activeIndex = index;
		return this.activeIndex;
	}

	clear() {
		this.activeIndex = -1;
		return this.activeIndex;
	}

	hasActiveOption() {
		return this.activeIndex >= 0 && this.activeIndex < this.optionCount;
	}
}
