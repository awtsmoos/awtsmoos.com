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

const CAPACITY_KEY = '__awtsmoosBlobCapacity';
function capacityOf(value) {
	const meta = (value && value.meta) || {};
	const capacity = Number(meta[CAPACITY_KEY] || value.length || 0);
	return Number.isFinite(capacity) && capacity >= value.length ? capacity : value.length;
}

class BlobBody {
	constructor(database) {
		this.db = database;
	}

	create(input = 0, metadata = {}) {
		const initial = Buffer.isBuffer(input) || input instanceof Uint8Array || typeof input === 'string'
			? Buffer.from(input)
			: null;
		const size = initial ? initial.length : Math.max(0, Number(input || 0));
		let allocSize = size;
		let meta = metadata;
		if (metadata.awtsmoosBlobGrowth === true && size >= 1024 * 1024) {
			const growth = Math.min(16 * 1024 * 1024, Math.max(2 * 1024 * 1024, Math.ceil(size * 0.25)));
			allocSize = size + growth;
			meta = Object.assign({}, metadata, { [CAPACITY_KEY]: allocSize });
		}
		const location = this.db.allocator.allocate(allocSize);
		this.db.allocator.leaseRange(location.offset, allocSize, 'blob-body');
		try {
			if (initial && initial.length) this.db.pager.writeExact(location.offset, initial);
			if (!initial && allocSize > 0) helpers.zero(this.db, location.offset, allocSize);
			return helpers.createToken(location, size, meta);
		} catch (error) {
			this.db.allocator.releaseLease(location.offset, allocSize);
			this.db.allocator.free(location.offset, allocSize);
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
		if (end <= capacityOf(value)) {
			if (source.length) this.db.pager.writeExact(value.offset + start, source);
			return { ...value, length: Math.max(value.length, end) };
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
		this.db.allocator.releaseLease(value.offset, capacityOf(value));
		this.db.allocator.free(value.offset, capacityOf(value));
		return true;
	}

	_value(blob) {
		const value = helpers.plain(blob);
		helpers.assertBlob(value);
		return value;
	}
}

module.exports = BlobBody;
