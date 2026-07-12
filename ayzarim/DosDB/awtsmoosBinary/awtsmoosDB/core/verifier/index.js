// B"H

/**
 * @file core/verifier/index.js
 * @chapter The Reachable World Is Counted Before The Void Is Named
 * @description
 * Coordinates structure traversal, special-token ownership, overlap detection,
 * VirtualFs bodies, and complement construction without hydrating the database.
 */

const constants = require('../../constants.js');
const Pointer = require('../../utils/pointer/crown.js');
const RangeLedger = require('./rangeLedger.js');
const { visitBlob, visitText } = require('./tokenVisitors.js');
const { visitAnchor, visitDictionary } = require('./anchorDictionaryVisitors.js');
const visitMap = require('./mapVisitor.js');
const { visitSequence, visitFlatArray } = require('./sequenceVisitors.js');

const TYPE = constants.VAL_TYPE;

class DbVerifier {
	constructor(db) {
		this.db = db;
		this.bad = [];
		this.seen = new Set();
		this.ownedBodies = new Set();
		this.ledger = new RangeLedger(db.allocator.cursor, this.bad);
		this.ledger.add({ offset: 0, length: 64 }, 'superblock');
	}

	run() {
		this.visitSeal(this.db.rootPtrRaw, 'root');
		this.visitSeal(this.db.freeListPtrRaw, 'free-list');
		this.visitSparseArrays();
		const reachable = this.ledger.finalize();
		const free = this.ledger.complement(reachable, 64);
		return {
			ok: this.bad.length === 0,
			errors: this.bad,
			reachableRanges: reachable.length,
			reachableBytes: reachable.reduce((sum, range) => sum + range.length, 0),
			freeRanges: free.length,
			freeBytes: free.reduce((sum, range) => sum + range.length, 0),
			free,
			logicalBytes: this.db.allocator.cursor,
			physicalBytes: this.db.storageStats().physicalBytes
		};
	}

	mark(pointer, tag) {
		return this.ledger.add(pointer, tag);
	}

	markOwnedBody(pointer, tag) {
		const key = `${pointer.offset}:${pointer.length}`;
		if (this.ownedBodies.has(key)) return true;
		this.ownedBodies.add(key);
		return this.mark(pointer, tag);
	}

	visitSeal(seal, tag) {
		if (!seal) return;
		let pointer;
		try {
			pointer = Buffer.isBuffer(seal) ? Pointer.decode(seal) : seal;
		} catch (error) {
			this.bad.push({ tag, reason: 'bad-pointer', message: error.message });
			return;
		}
		if (!pointer) return;
		const key = `${pointer.type}:${pointer.offset}:${pointer.length}`;
		if (this.seen.has(key)) return;
		this.seen.add(key);
		if (!this.mark(pointer, tag)) return;
		try {
			this.visitPointer(pointer, tag);
		} catch (error) {
			this.bad.push({ tag, reason: 'visit-failed', message: error.message, ptr: pointer });
		}
	}

	visitPointer(pointer, tag) {
		if (pointer.type === TYPE.BLOB) return visitBlob(this, pointer, tag);
		if (pointer.type === TYPE.TEXT) return visitText(this, pointer, tag);
		if (pointer.type === TYPE.ANCHOR) return visitAnchor(this, pointer, tag);
		if ([TYPE.DICTIONARY, TYPE.OBJECT, TYPE.SMART_OBJECT].includes(pointer.type)) return visitDictionary(this, pointer, tag);
		if ([TYPE.MAP, TYPE.JS_MAP].includes(pointer.type)) return visitMap(this, pointer, tag);
		if ([TYPE.SEQUENCE, TYPE.SET, TYPE.ARRAY, TYPE.JS_SET].includes(pointer.type)) return visitSequence(this, pointer, tag);
		if (pointer.type === TYPE.SMART_ARRAY) return visitFlatArray(this, pointer, tag);
	}

	visitSparseArrays() {
		const arrays = this.db.sparseArrays && this.db.sparseArrays.arrays;
		if (!arrays) return;
		for (const [path, record] of arrays.entries()) {
			if (!record?.chunks) continue;
			for (const [chunk, slots] of Object.entries(record.chunks)) {
				for (const [slot, entry] of Object.entries(slots || {})) {
					if (entry?.ptr) this.visitSeal(Buffer.from(entry.ptr, 'hex'), `sparse.${path}.${chunk}.${slot}`);
				}
			}
		}
	}
}

module.exports = DbVerifier;
