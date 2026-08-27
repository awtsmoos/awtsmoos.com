// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file structure/manifest/primitive/scribe.js
 * @chapter The External Body's Lease Ends When Its Token Enters The Build
 * @description
 * Runs the ordered primitive encoder choir for packed and persisted scalars.
 * Blob and text-body leases transfer inside the active build generation as soon
 * as token bytes exist. Metrics are resolved at write time because the database
 * creates its scribe before the byte ledger. The Awtsmoos preserves ownership
 * truth and the exact measure of every compressed vessel.
 */

const Pointer = require('../../../utils/pointer/crown.js');
const encoders = require('./encoders/index.js');

class PrimitiveScribe {
	constructor(allocator, metrics = null) {
		this.allocator = allocator;
		this.metrics = metrics;
	}

	encode(value) {
		for (const encoder of encoders) {
			const packet = encoder(value, this);
			if (!packet) continue;
			this._releaseExternalLeases(value);
			return packet;
		}
		return null;
	}

	save(value) {
		const packet = this.encode(value);
		if (!packet) {
			throw new Error(`B"H unsupported primitive value: ${Object.prototype.toString.call(value)}`);
		}

		const location = this.allocator.allocate(packet.buffer.length);
		this.allocator.db.pager.writeExact(location.offset, packet.buffer);
		const metrics = this.metrics || this.allocator.db.metrics;
		if (metrics && typeof metrics.recordPrimitive === 'function') {
			metrics.recordPrimitive(packet);
		}
		return Pointer.encode(packet.type, location.offset, packet.buffer.length);
	}

	_releaseExternalLeases(value) {
		if (!value || typeof this.allocator.releaseLease !== 'function') return;
		if (value.__awtsmoosBlob === true) {
			this.allocator.releaseLease(Number(value.offset), Number(value.length));
			return;
		}
		if (value.__awtsmoosText !== true || !Array.isArray(value.blocks)) return;
		for (const block of value.blocks) {
			const blob = block && block.blob;
			if (!blob || blob.__awtsmoosBlob !== true) continue;
			this.allocator.releaseLease(Number(blob.offset), Number(blob.length));
		}
	}
}

module.exports = PrimitiveScribe;
