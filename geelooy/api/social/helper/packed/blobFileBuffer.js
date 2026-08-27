// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BlobFileBuffer
 * @description
 * Presents one FS3 virtual file as the legacy random-access buffer interface. The
 * Awtsmoos reveals original logical bytes through db.fs, so identity and compressed
 * body tokens remain equally invisible to every AwtsmoosJSON reader.
 */

class BlobFileBuffer {
	constructor(database, virtualPath, name = virtualPath) {
		this.db = database;
		this.virtualPath = virtualPath;
		this.name = name;
		this.path = name;
		this.isFileBuffer = true;
		this.isClosed = false;
		const status = database.fs.stat(virtualPath);
		if (!status?.exists || status.type !== 'file') {
			throw new Error(`B"H FS3 file not found: ${virtualPath}`);
		}
		this.stats = { size: Number(status.size || 0) };
		this._length = this.stats.size;
		return new Proxy(this, {
			get(target, property) {
				if (!Number.isNaN(Number(property))) {
					return target.readUInt8(Number(property));
				}
				return target[property];
			}
		});
	}

	get length() { return this._length; }
	subarray(start = 0, end = this.length) {
		return this.readBuffer(start, end);
	}
	toString(mode = 'utf8', start = 0, end = this.length) {
		return this.subarray(start, end).toString(mode);
	}
	readBuffer(start = 0, end = this.length) {
		return this.db.fs.readRange(
			this.virtualPath,
			start,
			Math.max(0, end - start)
		);
	}
	readUInt8(offset) { return this.readBuffer(offset, offset + 1).readUInt8(0); }
	readUInt16BE(offset) { return this.readBuffer(offset, offset + 2).readUInt16BE(0); }
	readUInt32BE(offset) { return this.readBuffer(offset, offset + 4).readUInt32BE(0); }
	readUIntBE(offset, length) {
		return this.readBuffer(offset, offset + length).readUIntBE(0, length);
	}
	readString(offset, length) {
		return this.readBuffer(offset, offset + length)
			.toString('utf8')
			.replace(/\0/g, '');
	}
	read(buffer, offset = 0, length = buffer.length, position = 0) {
		const chunk = this.readBuffer(position || 0, (position || 0) + length);
		chunk.copy(buffer, offset, 0, chunk.length);
		return chunk.length;
	}
	write() { throw new Error('B"H use bridge.writeBuffer for replacement writes'); }
	truncate() { throw new Error('B"H use bridge.writeBuffer for replacement writes'); }
	close() { this.isClosed = true; }
}

module.exports = BlobFileBuffer;