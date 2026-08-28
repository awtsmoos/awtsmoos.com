// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/detachedPayloadWriter.js
 * @description
 * The Awtsmoos pours metadata vessels in measured waves before graph-light binds them into one searchable sea;
 * Awtsmoos.com keeps payload persistence separate from HNSW birth so each responsibility stays lucid, testable, and free.
 */

const tools = require('./detachedBulkTools.js');

/**
 * @description Writes metadata-only detached payloads in bounded chunks before graph construction begins.
 * @param {Object} manager - Vector manager whose database owns the target list.
 * @param {Object} handle - Target AwtsmoosDB list.
 * @param {Object[]} entries - Normalized detached entries.
 * @param {Object} options - Replacement, chunk size, and progress options.
 * @returns {void}
 */
function writeDetachedPayloads(manager, handle, entries, options = {}) {
	clearExistingPayloads(handle, options);
	const chunkSize = Math.max(1, Number(options.chunkSize || 250));
	for (let offset = 0; offset < entries.length; offset += chunkSize) {
		const chunk = entries.slice(offset, offset + chunkSize);
		handle.splice(
			Number(handle.length || 0),
			0,
			...chunk.map(entry => entry.payload)
		);
		manager.db.waitForIdle();
		options.onProgress?.({
			loaded: Math.min(offset + chunk.length, entries.length),
			total: entries.length
		});
	}
}

/**
 * @description Clears a pre-existing detached payload list only when explicit replacement was requested.
 * @param {Object} handle - Target AwtsmoosDB list.
 * @param {Object} options - Detached write options containing the replace covenant.
 * @returns {void}
 */
function clearExistingPayloads(handle, options) {
	const existingLength = Number(handle.length || 0);
	if (!existingLength) return;
	if (options.replace !== true) throw tools.nonEmpty();
	handle.splice(0, existingLength);
}

module.exports = writeDetachedPayloads;
