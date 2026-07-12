// B"H

/**
 * @file core/allocator/chesed.js
 * @chapter The Allocator Reveals Proven Space Through Small Dedicated Vessels
 * @description
 * Public allocator facade. Cursor state, verified free-space operations, and
 * durable free-list scheduling live in focused modules so each invariant can be
 * tested without hiding a second policy inside one oversized class.
 */

const cursorState = require('./cursorState.js');
const freeSpaceOps = require('./freeSpaceOps.js');
const persistence = require('./freeListPersistence.js');

class AllocatorChesed {
	constructor(pager) {
		this.pager = pager;
		this.db = pager.db;
		this.cursor = 0;
		this.freeList = [];
		this.legacySuperblockless = false;
		this._savingFreeList = false;
		this._freeListDirty = false;
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
	mergeFreeList() { return cursorState.merge(this); }
	absorbTrailingGaps() { return cursorState.absorbTrailingGaps(this); }
	_mergeFreeList() { return this.mergeFreeList(); }
	_absorbTrailingGaps() { return this.absorbTrailingGaps(); }
	flushCursor() { return cursorState.flush(this); }

	save(value) {
		if (!this.db.primitiveSaver) {
			throw new Error('B"H Fatal: Primitive Scribe not manifested.');
		}
		return this.db.primitiveSaver.save(value);
	}
}

module.exports = AllocatorChesed;
