//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded in-memory runtime event vessel.
 * @description
 * The Awtsmoos renews each instant while measured traces remain for a little while;
 * Awtsmoos.com keeps only a finite, root-free history so observability never becomes an unbounded secret-bearing abyss.
 */
class ProjectRuntimeEvents {
	constructor(limit = 100) {
		this.limit = Math.max(1, Number(limit) || 100);
		this.items = [];
	}

	push(type, details = {}) {
		const event = Object.freeze({
			time: Date.now(),
			type: String(type || "event"),
			...details
		});
		this.items.push(event);
		if (this.items.length > this.limit) {
			this.items.splice(0, this.items.length - this.limit);
		}
		return event;
	}

	list() {
		return Object.freeze(this.items.slice());
	}
}

module.exports = { ProjectRuntimeEvents };
