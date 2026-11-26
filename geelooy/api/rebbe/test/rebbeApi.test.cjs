//B"H
// Unit tests for the pure parts of the Rebbe sichos API: query
// normalization, bundle id codec, and the stored-ZIP writer.
const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeQuery } = require("../lib/search.js");
const { createBundleId, decodeBundleId, makeStoredZip } = require("../lib/bundle.js");
const { joinMp3Buffers } = require("../lib/mp3join.js");
const { bundlePage } = require("../lib/page.js");

/** Builds one synthetic MPEG1 Layer III frame: 64 kbps, 48000 Hz, 192 bytes. */
function syntheticFrame() {
	const frame = Buffer.alloc(192);
	frame[0] = 0xff;
	frame[1] = 0xfb;
	frame[2] = 0x54;
	frame[3] = 0x00;
	return frame;
}

test("joinMp3Buffers joins frames and resyncs past garbage", () => {
	const seg1 = Buffer.concat([syntheticFrame(), syntheticFrame(), syntheticFrame()]);
	const seg2 = Buffer.concat([Buffer.from([0x00, 0x13, 0x37]), syntheticFrame(), syntheticFrame()]);
	const out = joinMp3Buffers([seg1, seg2]);
	assert.equal(out.frameCount, 5);
	assert.equal(out.buffer.length, 5 * 192);
	assert.ok(out.skippedBytes >= 3);
});

test("joinMp3Buffers rejects a non-MP3 segment", () => {
	const ogg = Buffer.concat([Buffer.from("OggS", "latin1"), Buffer.alloc(2000, 7)]);
	assert.throws(() => joinMp3Buffers([syntheticFrame(), ogg]), /not a real MP3/);
});

test("normalizeQuery: exact month/day", () => {
	const q = normalizeQuery({ month: "3", day: "19" });
	assert.deepEqual(q.months, [3]);
	assert.deepEqual(q.days, [19]);
	assert.deepEqual(q.years, []);
});

test("normalizeQuery: ranges and lists", () => {
	const q = normalizeQuery({ monthFrom: "3", monthTo: "4", dayFrom: "15", dayTo: "19", years: "5749,5750" });
	assert.deepEqual(q.months, [3, 4]);
	assert.deepEqual(q.days, [15, 16, 17, 18, 19]);
	assert.deepEqual(q.years, ["5749", "5750"]);
});

test("normalizeQuery: invalid exact values become a match-nothing sentinel, limits clamped", () => {
	const q = normalizeQuery({ month: "99", day: "0", limit: "9999" });
	assert.deepEqual(q.months, [-1]);
	assert.deepEqual(q.days, [-1]);
	assert.equal(q.limit, 200);
});

test("bundle id codec round-trips", () => {
	const { id } = createBundleId({ month: "3", day: "19" }, "Yud Tes Kislev");
	const decoded = decodeBundleId(id);
	assert.deepEqual(decoded.request.months, [3]);
	assert.deepEqual(decoded.request.days, [19]);
	assert.equal(decoded.title, "Yud Tes Kislev");
});

test("bundle id codec rejects garbage", () => {
	assert.throws(() => decodeBundleId("not-a-bundle"), /Invalid bundle id/);
});

test("makeStoredZip produces a parseable stored zip", () => {
	const zip = makeStoredZip([
		{ name: "a/one.mp3", data: Buffer.from("hello") },
		{ name: "b/two.mp3", data: Buffer.from("world!") }
	]);
	assert.equal(zip.readUInt32LE(0), 0x04034b50);
	const end = zip.subarray(zip.length - 22);
	assert.equal(end.readUInt32LE(0), 0x06054b50);
	assert.equal(end.readUInt16LE(10), 2);
	assert.ok(zip.includes(Buffer.from("hello")));
	assert.ok(zip.includes(Buffer.from("a/one.mp3")));
});

test("bundle page has no WAV option and converts to MP3 in the browser", () => {
	const html = bundlePage("/api/rebbe");
	assert.ok(!html.includes("btn-wav"), "WAV button must be gone");
	assert.ok(!html.includes("merged WAV"), "WAV wording must be gone");
	assert.ok(!html.includes("downloadWav"), "WAV handler must be gone");
	assert.ok(html.includes("convertToMp3"), "MP3 conversion path must exist");
	assert.ok(html.includes("Mp3Encoder"), "lamejs encoder must be wired");
	assert.ok(html.includes("sniffIsMp3"), "byte sniffing must decide join vs convert");
	assert.ok(!/<script[^>]*lame/.test(html), "encoder must load lazily, not via a script tag");
});

test("bundle page wires the WebCodecs media-encoder path with feature detection and lamejs fallback", () => {
	const html = bundlePage("/api/rebbe");
	assert.ok(html.includes("probeWebCodecs"), "WebCodecs support probe must exist");
	assert.ok(html.includes("AudioEncoder.isConfigSupported"), "MP3 encode support must be feature-detected, never assumed");
	assert.ok(html.includes("AudioDecoder.isConfigSupported"), "decoder support must be feature-detected");
	assert.ok(html.includes("convertWithWebCodecs"), "WebCodecs conversion path must exist");
	assert.ok(html.includes("convertWithLamejs"), "lamejs fallback path must remain");
	assert.ok(html.includes("FallbackToLamejs"), "WebCodecs path must be able to decline into the fallback");
	assert.ok(html.includes("splitMp3Frames"), "MP3 elementary-stream splitter must feed AudioDecoder");
	assert.ok(html.includes("demuxOggOpus"), "Ogg/Opus demuxer must feed AudioDecoder");
	assert.ok(html.includes("EncodedAudioChunk"), "decoder input must be WebCodecs chunks");
	assert.ok(html.includes("__rebbeConvert"), "chosen engine must be published for observability");
	assert.ok(html.includes("codec: 'mp3'") || html.includes('codec: "mp3"') || html.includes("codec: 'mp3'"), "encoder must be configured for MP3 - never a silent format change");
});
