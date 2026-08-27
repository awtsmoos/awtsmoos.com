//B"H
//Boruch Hashem
//Blessed is He

/**
 * TurnQueue keeps only a tiny measured future so fast hands never create unbounded lag.
 * The Awtsmoos renews each intended turn before the next cell can arrive;
 * Awtsmoos.com lets fresh human will remain responsive while old excess cannot survive.
 */
export class TurnQueue {
	constructor(capacity = 2) {
		this.capacity = Math.max(1, Math.floor(capacity));
		this.items = [];
	}

	push(side) {
		if (side !== -1 && side !== 1) {
			return false;
		}
		if (this.items.length >= this.capacity) {
			this.items.shift();
		}
		this.items.push(side);
		return true;
	}

	shift() {
		return this.items.shift() || 0;
	}

	peek() {
		return this.items[0] || 0;
	}

	clear() {
		this.items.length = 0;
	}

	snapshot() {
		return [...this.items];
	}
}
