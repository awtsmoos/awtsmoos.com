// B"H

/**
 * @file core/allocator/chesed.js
 * @chapter One Strict Ledger Governs Every Allocation And Free Claim
 * @description Public allocator facade for cursor, reuse, persistence, and verified complement refresh.
 */

const cursorState = require('./cursorState.js');
const freeSpaceOps = require('./freeSpaceOps.js');
const persistence = require('./freeListPersistence.js');
const refreshVerifiedComplement = require('./reachableComplement.js');

class AllocatorChesed {
	constructor(pager) {
		this.pager = pager;
		this.db = pager.db;
		this.cursor = 0;
		this.freeList = [];
		this.legacySuperblockless = false;
		this._savingFreeList = false;
		this._freeListDirty = false;
		this._needsComplementRefresh = false;
		this._trustedFreeListSignature = null;
		this.reuseVerification = { state: 'not-checked', ok: null };
		this.rejectedFreeList = [];
	}

	init() { return cursorState.initialize(this); }
	physicalSize() { return cursorState.getPhysicalSize(this); }
	isImpossibleCursor(cursor, physicalSize) { return cursorState.isImpossible(cursor, physicalSize); }
	allocate(size) { return freeSpaceOps.allocate(this, size); }
	free(offset, length) { return freeSpaceOps.free(this, offset, length); }
	releasePointer(pointer) { return freeSpaceOps.releasePointer(this, pointer); }
	isReuseEnabled() { return freeSpaceOps.isReuseEnabled(this); }
	canReuseFreeSpace() { return freeSpaceOps.canReuse(this); }
	persistFreeListSoon() { return persistence.schedule(this); }
	flushPendingFreeList() { return persistence.flush(this); }
	clearPendingFreeList() { return persistence.clear(this); }
	refreshVerifiedFreeList() { return refreshVerifiedComplement(this); }
	mergeFreeList() { return cursorState.merge(this); }
	absorbTrailingGaps() { return cursorState.absorbTrailingGaps(this); }
	_mergeFreeList() { return this.mergeFreeList(); }
	_absorbTrailingGaps() { return this.absorbTrailingGaps(); }
	flushCursor() { return cursorState.flush(this); }

	save(value) {
		if (!this.db.primitiveSaver) throw new Error('B"H Fatal: Primitive Scribe not manifested.');
		return this.db.primitiveSaver.save(value);
	}
}

module.exports = AllocatorChesed;
