// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file utils/nodeChecksum.js
 * @chapter A Torn Vessel Declares Itself Instead Of Parsing As Garbage
 * @description
 * Appends and checks a 4-byte FNV-1a-32 trailer on map, sequence, and
 * dictionary nodes (§8.5). Before this, only the 4-byte magic was
 * validated, so a torn node with intact magic parsed as garbage — the
 * Oct 27 failure mode. Legacy nodes without a trailer keep loading
 * exactly as before; a node whose parse ends exactly 4 bytes short of
 * its seal must carry a matching trailer, or it fails closed.
 *
 * Detection is by parse position, not by guessing: the caller parses
 * the node's content and reports where the content ended. A remainder
 * of 0 is a legacy node; a remainder of 4 must be the checksum of the
 * preceding bytes; any other remainder keeps today's lenient behavior
 * (older writers never left slack, so it can only be foreign bytes).
 */

const TRAILER_BYTES = 4;

function checksumOf(buffer) {
	let hash = 0x811c9dc5;
	for (let index = 0; index < buffer.length; index++) {
		hash ^= buffer[index];
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

/** Returns a new buffer: content followed by its 4-byte checksum trailer. */
function appendTrailer(content) {
	const sealed = Buffer.allocUnsafe(content.length + TRAILER_BYTES);
	content.copy(sealed, 0);
	sealed.writeUInt32LE(checksumOf(content), content.length);
	return sealed;
}

/**
 * Checks the bytes after parsed content.
 * @param {Buffer} buffer - Whole node bytes as read (seal length).
 * @param {number} contentEnd - Offset where the content parse ended.
 * @returns {'legacy'|'checksummed'|null} 'legacy' when the parse consumed
 *   the whole seal, 'checksummed' when a 4-byte trailer matched, null
 *   when the parse overran or a present trailer mismatched (corrupt).
 */
function checkTrailer(buffer, contentEnd) {
	if (!Buffer.isBuffer(buffer) || contentEnd < 0) return null;
	const remaining = buffer.length - contentEnd;
	if (remaining < 0) return null;
	if (remaining === 0) return 'legacy';
	if (remaining === TRAILER_BYTES) {
		const stored = buffer.readUInt32LE(contentEnd);
		return stored === checksumOf(buffer.subarray(0, contentEnd)) ? 'checksummed' : null;
	}
	return 'legacy';
}

module.exports = {
	TRAILER_BYTES,
	appendTrailer,
	checkTrailer,
	checksumOf
};
