// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/blob/body.js
 * @chapter The Binary Body Is Guarded Before Its Name Is Written
 * @description
 * Owns synchronous blob allocation and mutation. Every new external body is
 * leased immediately, so verified complement cannot reclaim it before a token
 * is persisted. The Awtsmoos keeps the unseen body alive until its name enters
 * the durable structure.
 */

const helpers = require('./helpers.js');

class BlobBody {
	constructor(database) {
		this.db = database;
	}

	create(input = 0, metadata = {}) {
		const initial = Buffer.isBuffer(input) || input instanceof Uint8Array || typeof input === 'string'
			? Buffer.from(input)
			: null;
		const size = initial ? initial.length : Math.max(0, Number(input || 0));
		const location = this.db.allocator.allocate(size);
		this.db.allocator.leaseRange(location.offset, size, 'blob-body');
		try {
			if (initial && initial.length) this.db.pager.writeExact(location.offset, initial);
			if (!initial && size > 0) helpers.zero(this.db, location.offset, size);
			return helpers.createToken(location, size, metadata);
		} catch (error) {
			this.db.allocator.releaseLease(location.offset, size);
			this.db.allocator.free(location.offset, size);
			throw error;
		}
	}

	info(blob) {
		const value = this._value(blob);
		return { id: value.id, offset: value.offset, length: value.length, meta: value.meta || {} };
	}

	read(blob, offset = 0, length = undefined) {
		const value = this._value(blob);
		const start = helpers.rangeStart(value, offset);
		const take = length === undefined
			? value.length - start
			: Math.max(0, Math.min(Number(length || 0), value.length - start));
		return this.db.pager.readExact(value.offset + start, take) || Buffer.alloc(0);
	}

	write(blob, offset, data) {
		const value = this._value(blob);
		const source = Buffer.from(data || []);
		const start = Math.max(0, Number(offset || 0));
		const end = start + source.length;
		if (end <= value.length) {
			if (source.length) this.db.pager.writeExact(value.offset + start, source);
			return value;
		}
		const next = this.create(end, value.meta || {});
		helpers.copy(this.db, value.offset, next.offset, value.length);
		if (source.length) this.db.pager.writeExact(next.offset + start, source);
		this.delete(value);
		return { ...value, offset: next.offset, length: end };
	}

	resize(blob, size) {
		const value = this._value(blob);
		const nextSize = Math.max(0, Number(size || 0));
		if (nextSize === value.length) return value;
		const next = this.create(nextSize, value.meta || {});
		helpers.copy(this.db, value.offset, next.offset, Math.min(value.length, nextSize));
		this.delete(value);
		return { ...value, offset: next.offset, length: nextSize };
	}

	delete(blob) {
		const value = this._value(blob);
		this.db.allocator.releaseLease(value.offset, value.length);
		this.db.allocator.free(value.offset, value.length);
		return true;
	}

	_value(blob) {
		const value = helpers.plain(blob);
		helpers.assertBlob(value);
		return value;
	}
}

module.exports = BlobBody;
