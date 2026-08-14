//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "./errors.js";

/**
 * Holds lexical names without leaking target registers into language meaning.
 * As the Awtsmoos creates every soul in its place, Awtsmoos.com gives each
 * declaration a truthful scope and lets child vessels receive without erasing.
 */
export class IrScope {
	constructor(parent = null) {
		this.parent = parent;
		this.symbols = new Map();
	}

	createChild() {
		return new IrScope(this);
	}

	define(name, symbol) {
		if (this.symbols.has(name)) {
			throw createIrError("IR_DUPLICATE_SYMBOL", `Duplicate symbol: ${name}`, { name });
		}
		const entry = Object.freeze({ name, ...symbol });
		this.symbols.set(name, entry);
		return entry;
	}

	resolve(name) {
		if (this.symbols.has(name)) {
			return this.symbols.get(name);
		}
		return this.parent ? this.parent.resolve(name) : null;
	}
}
