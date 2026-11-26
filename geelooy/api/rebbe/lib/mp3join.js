//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RebbeApiMp3Join
 * @description
 * A tolerant MPEG frame joiner for server-side bundle merges. The front
 * end's own joiner (apps/rebbe modules/download/farbrengen/mp3-join.js) is
 * strict: one corrupt frame header rejects the whole farbrengen, and real
 * Archive.org recordings do contain isolated bad headers that every player
 * (and ffmpeg) simply skips. This joiner walks complete lawful frames,
 * resynchronizes past isolated garbage, drops ID3 tags, and refuses —
 * honestly — when segments do not share one MPEG profile, because joining
 * unlike profiles into one file would lie about the audio.
 */

const BITRATES = {
	"1-1": [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
	"1-2": [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
	"1-3": [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
	"2-1": [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
	"2-2": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
	"2-3": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]
};
const SAMPLE_RATES = {
	"3": [44100, 48000, 32000],
	"2": [22050, 24000, 16000],
	"0": [11025, 12000, 8000]
};

/** Parses one MPEG audio frame header at offset; null when not a frame. */
function parseHeader(buffer, offset) {
	if (offset + 4 > buffer.length) return null;
	const b0 = buffer[offset], b1 = buffer[offset + 1], b2 = buffer[offset + 2];
	if (b0 !== 0xff || (b1 & 0xe0) !== 0xe0) return null;
	const version = (b1 >> 3) & 0x03;
	if (version === 1) return null;
	const layer = (b1 >> 1) & 0x03;
	if (layer === 0) return null;
	const bitrateIndex = (b2 >> 4) & 0x0f;
	if (bitrateIndex === 0 || bitrateIndex === 15) return null;
	const rateIndex = (b2 >> 2) & 0x03;
	if (rateIndex === 3) return null;
	const padding = (b2 >> 1) & 0x01;
	const versionKey = version === 3 ? "1" : "2";
	const layerNum = 4 - layer;
	const bitrate = BITRATES[`${versionKey}-${layerNum}`][bitrateIndex] * 1000;
	const sampleRate = SAMPLE_RATES[String(version)][rateIndex];
	let frameLength;
	if (layerNum === 1) frameLength = Math.floor(12 * bitrate / sampleRate + padding) * 4;
	else if (layerNum === 2) frameLength = Math.floor(144 * bitrate / sampleRate) + padding;
	else frameLength = Math.floor((version === 3 ? 144 : 72) * bitrate / sampleRate) + padding;
	if (frameLength < 4) return null;
	return {
		version,
		layer: layerNum,
		bitrate,
		sampleRate,
		frameLength,
		profile: `${version}/${layerNum}/${sampleRate}`
	};
}

/** Removes a leading ID3v2 tag when present. */
function stripId3v2(buffer) {
	if (buffer.length > 10 && buffer.toString("latin1", 0, 3) === "ID3") {
		const size = ((buffer[6] & 0x7f) << 21) | ((buffer[7] & 0x7f) << 14)
			| ((buffer[8] & 0x7f) << 7) | (buffer[9] & 0x7f);
		const footer = (buffer[5] & 0x10) ? 10 : 0;
		return buffer.subarray(Math.min(buffer.length, 10 + size + footer));
	}
	return buffer;
}

/** Removes a trailing ID3v1 tag when present. */
function stripId3v1(buffer) {
	if (buffer.length > 128 && buffer.toString("latin1", buffer.length - 128, buffer.length - 125) === "TAG") {
		return buffer.subarray(0, buffer.length - 128);
	}
	return buffer;
}

/**
 * Extracts the valid frame byte range of one segment, resyncing past
 * isolated corrupt bytes instead of rejecting the whole recording.
 * @param {Buffer} input Raw MP3 bytes.
 * @returns {{frames: Buffer, profile: string, skipped: number, frameCount: number}}
 */
function extractFrames(input) {
	const buffer = stripId3v1(stripId3v2(input));
	const parts = [];
	let profile = null;
	let skipped = 0;
	let frameCount = 0;
	let offset = 0;
	while (offset + 4 <= buffer.length) {
		const header = parseHeader(buffer, offset);
		if (!header || offset + header.frameLength > buffer.length) {
			offset += 1;
			skipped += 1;
			continue;
		}
		if (!profile) profile = header.profile;
		if (header.profile !== profile) {
			// A different profile mid-segment: resync-skip this frame start.
			offset += 1;
			skipped += 1;
			continue;
		}
		parts.push(buffer.subarray(offset, offset + header.frameLength));
		offset += header.frameLength;
		frameCount += 1;
	}
	return { frames: Buffer.concat(parts), profile, skipped, frameCount };
}

/**
 * Joins MP3 segment buffers into one MP3 buffer, losslessly at frame level.
 * @param {Buffer[]} segments MP3 files in playback order.
 * @returns {{buffer: Buffer, profile: string, frameCount: number, skippedBytes: number}}
 * @throws {Error} With .status 422 when profiles differ or no frames exist.
 */
function joinMp3Buffers(segments) {
	const parts = [];
	let profile = null;
	let frameCount = 0;
	let skippedBytes = 0;
	for (let i = 0; i < segments.length; i++) {
		const extracted = extractFrames(segments[i]);
		// Coverage guard: a misnamed non-MP3 file (e.g. Ogg/Opus carrying an
		// .mp3 name, which this corpus does contain) yields only scattered
		// false-sync frames. Real MP3 segments are almost entirely frames.
		if (!extracted.frameCount || extracted.frames.length < segments[i].length * 0.5) {
			const err = new Error(`Segment ${i + 1} is not a real MP3 stream (frames cover ${extracted.frames.length} of ${segments[i].length} bytes); it cannot be merged. Use the ZIP, which keeps every original file.`);
			err.status = 422;
			err.code = "SEGMENT_NOT_MP3";
			throw err;
		}
		if (!profile) profile = extracted.profile;
		if (extracted.profile !== profile) {
			const err = new Error(
				`Segment ${i + 1} has a different MP3 profile (${extracted.profile} vs ${profile}); ` +
				"lossless merge is not possible. Use the ZIP, which keeps every original file."
			);
			err.status = 422;
			err.code = "PROFILE_MISMATCH";
			throw err;
		}
		parts.push(extracted.frames);
		frameCount += extracted.frameCount;
		skippedBytes += extracted.skipped;
	}
	return { buffer: Buffer.concat(parts), profile, frameCount, skippedBytes };
}

module.exports = { joinMp3Buffers, extractFrames, parseHeader };
