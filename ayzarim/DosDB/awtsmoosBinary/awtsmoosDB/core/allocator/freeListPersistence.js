// B"H

/**
 * @file core/allocator/freeListPersistence.js
 * @chapter A Thousand Local Changes Become One Durable Ledger At The Boundary
 * @description
 * Coalesces free-list metadata writes across database batches. The in-memory
 * allocator remains current after every operation, while one seal is written at
 * the outer idle boundary instead of once per HNSW neighbor update.
 */

function schedule(allocator) {
	if (allocator.legacySuperblockless || allocator.db.options?.readOnly) return;
	allocator._freeListDirty = true;
	if (allocator.pager.isBatching) return;
	flush(allocator);
}

function flush(allocator) {
	if (!allocator._freeListDirty || allocator._savingFreeList) return false;
	if (allocator.legacySuperblockless || allocator.db.options?.readOnly) return false;
	if (typeof allocator.db._saveFreeListSeal !== 'function') return false;
	allocator._savingFreeList = true;
	try {
		allocator._freeListDirty = false;
		allocator.db._saveFreeListSeal();
		return true;
	} catch (error) {
		allocator._freeListDirty = true;
		throw error;
	} finally {
		allocator._savingFreeList = false;
	}
}

function clear(allocator) {
	allocator._freeListDirty = false;
}

module.exports = {
	clear,
	flush,
	schedule
};
