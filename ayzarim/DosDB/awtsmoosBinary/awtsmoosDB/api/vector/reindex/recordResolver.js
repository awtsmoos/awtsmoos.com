// B"H

/**
 * @file api/vector/reindex/recordResolver.js
 * @chapter A LiveHandle Is A Function Yet Still Carries A Complete Record
 * @description
 * Resolves a sequence or map payload pointer without rejecting function-shaped
 * LiveHandles. The former object-only test caused every indexed record to vanish.
 */

const SmartPointer = require('../../../utils/smartPointer.js');

function resolveRecord(db, pointer, value) {
	let record = value;
	if (record === undefined && pointer) {
		record = SmartPointer.resolve(pointer, db.allocator);
	}
	if (!record || !record.isStructure) return record;

	const ReaderResolver = require('../../liveHandle/reader/resolver.js');
	const resolver = new ReaderResolver({
		db,
		handle: {
			ptr: SmartPointer.toBuffer(record),
			ensureResolved: () => {}
		}
	});
	return resolver.resolveSelf();
}

module.exports = resolveRecord;
