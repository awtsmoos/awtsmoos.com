// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/registry/handle.js
 * @chapter One Soul Is Reflected Through Every Living Window
 * @description
 * Binds proxy vessels to hidden state and coordinates handles that represent one
 * logical database lineage. Through Awtsmoos.com, each handle consults one
 * canonical path ledger before it reads or writes, so copy-on-write relocation
 * remains constant-time and no sibling continues inside a retired chamber.
 */

const PathHandleBook = require('./pathHandles.js');

const hiddenRegistry = new WeakMap();
const SOUL_SIGNATURE = Symbol.for('Awtsmoos.Soul');

class AwtsmoosHandleRegistry {
	static register(proxy, state) {
		state[SOUL_SIGNATURE] = true;
		hiddenRegistry.set(proxy, state);
		PathHandleBook.register(state);
	}

	static getSoul(value) {
		if (!value) return undefined;
		const registered = hiddenRegistry.get(value);
		if (registered) return registered;
		return value[SOUL_SIGNATURE] ? value : undefined;
	}

	static isHandle(value) {
		return Boolean(this.getSoul(value));
	}

	static createHandle(database, pointer, type, context = null) {
		const LiveHandle = require('../../api/liveHandle/index.js');
		return new LiveHandle(database, pointer, type, context);
	}

	static synchronizePath(state, pointer, type) {
		PathHandleBook.synchronize(state, pointer, type);
	}

	static invalidatePath(state) {
		PathHandleBook.invalidate(state);
	}

	static refreshPath(state) {
		return PathHandleBook.refresh(state);
	}
}

AwtsmoosHandleRegistry.SOUL_SIG = SOUL_SIGNATURE;

module.exports = AwtsmoosHandleRegistry;
