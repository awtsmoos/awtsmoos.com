// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/liveHandle/pointer.js
 * @chapter The New Address Is Linked And Entered In The Canonical Book
 * @description
 * Refreshes the current and parent handles from the path ledger before
 * publishing copy-on-write relocation. Direct structures receive a new
 * canonical seal; anchored structures keep their outer identity and advance a
 * version. The Awtsmoos prevents every quiet sibling from writing into a former
 * chamber without requiring an ever-growing broadcast.
 */

const SmartPointer = require('../../utils/smartPointer/index.js');
const HandleRegistry = require('../../core/registry/handle.js');
const constants = require('../../constants.js');
const StableAnchor = require('../../structure/anchor/stable.js');

function updateAnchoredPointer(state, newPointer) {
	HandleRegistry.refreshPath(state);
	if (state.isUpdatingPointer) return;
	state.isUpdatingPointer = true;
	try {
		const decoded = SmartPointer.decode(newPointer);
		if (!decoded) return;
		const anchor = new StableAnchor(state.db);
		if (!anchor.update(state.ptr, decoded.type, newPointer)) {
			throw new Error('B"H stable anchor could not publish its relocated structure');
		}
	} finally {
		state.isUpdatingPointer = false;
	}
	HandleRegistry.invalidatePath(state);
}

function publishDirectPointer(state, newPointer) {
	HandleRegistry.refreshPath(state);
	if (state.ptr && Buffer.compare(state.ptr, newPointer) === 0) return;
	const decoded = SmartPointer.decode(newPointer);
	if (!decoded) return;
	const previousPointer = state.ptr;
	const previousType = state.type;
	state.ptr = newPointer;
	state.type = decoded.type;

	if (state.isUpdatingPointer) return;
	state.isUpdatingPointer = true;
	try {
		const parent = state.context && state.context.parent
			? HandleRegistry.getSoul(state.context.parent)
			: null;
		if (parent) {
			HandleRegistry.refreshPath(parent);
			parent.writer.set(state.context.key, newPointer, { isPtr: true });
		}
	} catch (error) {
		state.ptr = previousPointer;
		state.type = previousType;
		throw error;
	} finally {
		state.isUpdatingPointer = false;
	}
	HandleRegistry.synchronizePath(state, newPointer, decoded.type);
}

module.exports = {
	updatePointer(state, newPointer) {
		if (!Buffer.isBuffer(newPointer)) return;
		if (state.type === constants.VAL_TYPE.ANCHOR) {
			updateAnchoredPointer(state, newPointer);
			return;
		}
		publishDirectPointer(state, newPointer);
	}
};
