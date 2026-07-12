// B"H

/**
 * Holds input by source so keyboard, joystick, and hybrid devices cannot
 * erase one another. Every emission is a fresh object, never a shared ghost.
 */
export class InputState {
	constructor(onChange) {
		this.onChange = onChange;
		this.sources = new Map();
		this.directionOrder = [];
	}

	setSource(source, key, direction = null) {
		const previous = this.sources.get(source);
		if (previous?.key === key && previous?.direction === direction) return;
		this.sources.set(source, { key, direction });
		this.directionOrder = this.directionOrder.filter(item => item.source !== source);
		if (direction) this.directionOrder.push({ source, direction });
		this.emit();
	}

	clearSource(source) {
		if (!this.sources.delete(source)) return;
		this.directionOrder = this.directionOrder.filter(item => item.source !== source);
		this.emit();
	}

	clearAll() {
		if (this.sources.size === 0) return;
		this.sources.clear();
		this.directionOrder = [];
		this.emit();
	}

	snapshot() {
		const keys = {};
		for (const value of this.sources.values()) keys[value.key] = true;
		const activeIntent = [...this.directionOrder].reverse().find(item => this.sources.has(item.source));
		if (activeIntent) keys.__intent = activeIntent.direction;
		return keys;
	}

	emit() {
		this.onChange(this.snapshot());
	}
}
