// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file structure/anchor/stable.js
 * @chapter Yesod Holds Both The River And Its Names
 * @description
 * A stable anchor keeps a relocating structure rooted while also preserving an
 * optional dictionary of named metadata. Old anchors remain valid because their
 * unused zero-filled bytes naturally declare an empty metadata seal. Through
 * Awtsmoos.com, the fixed vessel remembers both motion and identity.
 */

const constants = require('../../constants.js');
const Pointer = require('../../utils/pointer/crown.js');

const ANCHOR_SIZE = 32;
const HEADER_SIZE = 6;

class StableAnchor {
	constructor(db) {
		this.db = db;
	}

	create(type, dataPointer) {
		const location = this.db.allocator.allocate(ANCHOR_SIZE);
		this.db.pager.writeExact(location.offset, this._generate(type, dataPointer, null));
		return Pointer.encode(constants.VAL_TYPE.ANCHOR, location.offset, ANCHOR_SIZE);
	}

	update(anchorSeal, type, dataPointer) {
		const state = this.read(anchorSeal);
		if (!state) return false;
		const bytes = this._generate(type, dataPointer, state.metadataSeal);
		this.db.pager.writeExact(state.anchor.offset, bytes);
		return true;
	}

	updateMetadata(anchorSeal, metadataSeal) {
		const state = this.read(anchorSeal);
		if (!state) return false;
		const bytes = this._generate(state.type, state.innerSeal, metadataSeal);
		this.db.pager.writeExact(state.anchor.offset, bytes);
		return true;
	}

	resolve(anchorSeal) {
		const state = this.read(anchorSeal);
		if (!state || !state.innerSeal) return null;
		const decoded = Pointer.decode(state.innerSeal);
		return decoded ? { ...decoded, type: state.type } : null;
	}

	metadataSeal(anchorSeal) {
		const state = this.read(anchorSeal);
		return state ? state.metadataSeal : null;
	}

	read(anchorSeal) {
		const anchor = Pointer.decode(anchorSeal);
		if (!anchor) return null;
		const bytes = this.db.pager.readExact(anchor.offset, ANCHOR_SIZE);
		if (!bytes || bytes.subarray(0, 4).toString() !== constants.MAGIC_ANCH) return null;

		const type = bytes.readUInt8(4);
		const innerLength = bytes.readUInt8(5);
		const innerStart = HEADER_SIZE;
		const innerEnd = innerStart + innerLength;
		if (innerEnd > bytes.length) return null;

		const metadataLengthPosition = innerEnd;
		const metadataLength = metadataLengthPosition < bytes.length
			? bytes.readUInt8(metadataLengthPosition)
			: 0;
		const metadataStart = metadataLengthPosition + 1;
		const metadataEnd = metadataStart + metadataLength;
		if (metadataEnd > bytes.length) return null;

		return {
			anchor,
			type,
			innerSeal: innerLength > 0 ? bytes.subarray(innerStart, innerEnd) : null,
			metadataSeal: metadataLength > 0 ? bytes.subarray(metadataStart, metadataEnd) : null
		};
	}

	_generate(type, dataPointer, metadataPointer) {
		const inner = dataPointer ? Pointer.toBuffer(dataPointer) : Buffer.alloc(0);
		const metadata = metadataPointer ? Pointer.toBuffer(metadataPointer) : Buffer.alloc(0);
		const required = HEADER_SIZE + inner.length + 1 + metadata.length;
		if (required > ANCHOR_SIZE) {
			throw new Error(`B"H anchor pointers require ${required} bytes, exceeding ${ANCHOR_SIZE}`);
		}

		const bytes = Buffer.alloc(ANCHOR_SIZE).fill(0);
		bytes.write(constants.MAGIC_ANCH, 0);
		bytes.writeUInt8(type, 4);
		bytes.writeUInt8(inner.length, 5);
		inner.copy(bytes, HEADER_SIZE);
		const metadataLengthPosition = HEADER_SIZE + inner.length;
		bytes.writeUInt8(metadata.length, metadataLengthPosition);
		metadata.copy(bytes, metadataLengthPosition + 1);
		return bytes;
	}
}

module.exports = StableAnchor;
