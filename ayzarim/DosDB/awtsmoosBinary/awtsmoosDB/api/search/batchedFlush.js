// B"H

/**
 * @file api/search/batchedFlush.js
 * @chapter One Path Of Token Changes Crosses One Pager Boundary
 * @description Drains one buffered search path without recursively forcing database idle.
 */

function flushSearchPath(manager, path) {
	const batch = manager._updateBuffer.get(path);
	if (!batch || batch.length === 0) return;
	manager._updateBuffer.delete(path);
	manager._ensureSysIndex();
	const previousBatching = manager.db.pager.isBatching;
	manager.db.pager.isBatching = true;
	try {
		const indexer = manager._getIndexer();
		for (const update of batch) {
			indexer.updateIndex(
				path,
				update.newPtr,
				update.oldPtr,
				update.oldVal,
				update.newVal
			);
		}
		indexer.flush();
	} finally {
		manager.db.pager.isBatching = previousBatching;
	}
}

module.exports = flushSearchPath;
