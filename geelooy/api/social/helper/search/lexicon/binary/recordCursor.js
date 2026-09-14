//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LexiconBinaryRecordCursor
 * @description
 * Bounds-checked cursor for one compact lexical record. Every read is limited
 * to the supplied record Buffer so malformed lengths cannot escape the record.
 */

const Leb128 = require('../../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/utils/leb128/scribe.js');

/** Creates one strict sequential reader over a single binary record. */
class RecordCursor {
	constructor(buffer) {
		this.buffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
		this.offset = 0;
	}

	/** Reads one raw byte or rejects truncated input. */
	byte() {
		this.require(1);
		return this.buffer[this.offset++];
	}

	/** Reads one unsigned LEB128 value and rejects unsafe integers. */
	uint() {
		const decoded = Leb128.read(this.buffer, this.offset);
		if (!Number.isSafeInteger(decoded.value) || decoded.value < 0) {
			throw new Error('lexicon_binary_unsafe_integer');
		}
		this.offset += decoded.bytesRead;
		return decoded.value;
	}

	/** Reads exactly length bytes without copying outside this record. */
	bytes(length) {
		this.require(length);
		const value = this.buffer.subarray(this.offset, this.offset + length);
		this.offset += length;
		return value;
	}

	/** Reads one exact UTF-8 string prefixed by its variable byte length. */
	text() {
		const length = this.uint();
		return this.bytes(length).toString('utf8');
	}

	/** Requires enough remaining bytes for the next bounded operation. */
	require(length) {
		if (!Number.isSafeInteger(length) || length < 0 || this.offset + length > this.buffer.length) {
			throw new Error('lexicon_binary_truncated_record');
		}
	}

	/** Proves the decoder consumed the complete record and nothing remains. */
	assertFinished() {
		if (this.offset !== this.buffer.length) {
			throw new Error('lexicon_binary_trailing_bytes');
		}
	}
}

module.exports = RecordCursor;
