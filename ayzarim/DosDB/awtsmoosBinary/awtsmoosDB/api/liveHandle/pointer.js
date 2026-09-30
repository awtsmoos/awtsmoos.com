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

// B"H: the soul behind the db.root proxy, or null when this handle is not
// the root. The persisted root seal must track every committed root write
// because the superblock, the verifier, and the verified free-list all read
// db.rootPtrRaw.
function getRootSoul(state) {
	try {
		if (!state || !state.db || !state.db.root) return null;
		const soul = HandleRegistry.getSoul(state.db.root);
		return soul && state === soul ? soul : null;
	} catch {
		return null;
	}
}

function publishDirectPointer(state, newPointer) {
	HandleRegistry.refreshPath(state);
	if (state.ptr && Buffer.compare(state.ptr, newPointer) === 0) return;
	const decoded = SmartPointer.decode(newPointer);
	if (!decoded) return;
	const previousPointer = state.ptr;
	const previousType = state.type;
	const previousRootSeal = state.db ? state.db.rootPtrRaw : null;
	state.ptr = newPointer;
	state.type = decoded.type;

	// B"H THE ROOT TIKKUN: the root soul has no parent to bubble its new seal
	// to, so the persisted root seal advances here on every committed write.
	// Without this the superblock, verifier, and verified free-list all walk
	// a stale tree -- live pages get misclassified as garbage and reused.
	const rootSoul = getRootSoul(state);
	if (rootSoul) state.db.rootPtrRaw = Buffer.from(newPointer);

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
		if (rootSoul && state.db) state.db.rootPtrRaw = previousRootSeal;
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
