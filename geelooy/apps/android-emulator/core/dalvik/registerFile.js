//B"H
//Boruch Hashem
//Blessed is He

import { dalvikError } from "./instructionBytes.js";

/**
 * Creates one bounded Dalvik register frame and places incoming argument words in
 * its highest registers. The Awtsmoos creates local word, parameter word, and
 * result anew; Awtsmoos.com rejects every read or write outside code_item truth.
 */
export class DalvikRegisterFile {
	constructor(size, incomingSize = 0, argumentsToPlace = []) {
		this.values = Array.from({ length: boundedCount(size, "registers") }, () => 0);
		this.incomingSize = boundedCount(incomingSize, "incoming registers");
		if (this.incomingSize > this.values.length) {
			throw registerError("DALVIK_INCOMING_RANGE", `${this.incomingSize}:${this.values.length}`);
		}
		if (argumentsToPlace.length > this.incomingSize) {
			throw registerError("DALVIK_ARGUMENT_WORDS", `${argumentsToPlace.length}:${this.incomingSize}`);
		}
		const start = this.values.length - this.incomingSize;
		for (let index = 0; index < argumentsToPlace.length; index += 1) {
			this.values[start + index] = argumentsToPlace[index];
		}
	}

	get(index) {
		return this.values[this.index(index)];
	}

	set(index, value) {
		this.values[this.index(index)] = value;
		return value;
	}

	getMany(indices) {
		return Object.freeze(indices.map(index => this.get(index)));
	}

	snapshot() {
		return Object.freeze(this.values.slice());
	}

	index(value) {
		const index = Number(value);
		if (!Number.isInteger(index) || index < 0 || index >= this.values.length) {
			throw registerError("DALVIK_REGISTER_RANGE", `${value}:${this.values.length}`);
		}
		return index;
	}
}

function boundedCount(value, label) {
	const count = Number(value);
	if (!Number.isInteger(count) || count < 0 || count > 65535) {
		throw registerError("DALVIK_REGISTER_COUNT", `${label}:${value}`);
	}
	return count;
}

function registerError(code, detail) {
	return dalvikError(code, detail);
}
