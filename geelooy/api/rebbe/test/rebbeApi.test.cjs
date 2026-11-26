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

test("bundle page has no WAV option and converts in the browser", () => {
	const html = bundlePage("/api/rebbe");
	assert.ok(!html.includes("btn-wav"), "WAV button must be gone");
	assert.ok(!html.includes("merged WAV"), "WAV wording must be gone");
	assert.ok(!html.includes("downloadWav"), "WAV handler must be gone");
	assert.ok(html.includes("convertMergedAudio"), "merged-audio conversion dispatcher must exist");
	assert.ok(html.includes("Mp3Encoder"), "lamejs encoder must be wired");
	assert.ok(html.includes("sniffIsMp3"), "byte sniffing must decide join vs convert");
	assert.ok(!/<script[^>]*lame/.test(html), "encoder must load lazily, not via a script tag");
});

test("bundle page wires the WebCodecs Opus conversion path with feature detection and lamejs fallback", () => {
	const html = bundlePage("/api/rebbe");
	assert.ok(html.includes("probeWebCodecs"), "WebCodecs support probe must exist");
	assert.ok(html.includes("AudioEncoder.isConfigSupported"), "encode support must be feature-detected, never assumed");
	assert.ok(html.includes("AudioDecoder.isConfigSupported"), "decoder support must be feature-detected");
	assert.ok(html.includes("convertWithLamejs"), "lamejs fallback path must remain");
	assert.ok(html.includes("splitMp3Frames"), "MP3 elementary-stream splitter must feed AudioDecoder");
	assert.ok(html.includes("demuxOggOpus"), "Ogg/Opus demuxer must feed AudioDecoder");
	assert.ok(html.includes("__rebbeConvert"), "chosen engine must be published for observability");
	assert.ok(html.includes("webcodecs-opus"), "engine must be published as webcodecs-opus when the native path runs");
	assert.ok(html.includes("createOggOpusMuxer"), "encoded Opus chunks must be muxed into an Ogg file in-page");
	assert.ok(html.includes("OpusHead"), "muxer must write the OpusHead header");
	assert.ok(html.includes("rebbe-sichos-merged.opus"), "converted output must be saved as a .opus file");
	assert.ok(html.includes("createResampler48000"), "decoded audio must be resampled to the Opus encoder's 48 kHz while streaming");
});

test("bundle page runs conversion in a background worker with wake lock, notifications and resume UI", () => {
	const html = bundlePage("/api/rebbe");
	assert.ok(html.includes("new Worker(BASE + '/bundle/worker.js')"), "conversion must run in a dedicated worker");
	assert.ok(html.includes("runWorkerConversion"), "page must orchestrate the worker conversion");
	assert.ok(html.includes("wakeLock"), "a screen wake lock must be held during conversion");
	assert.ok(html.includes("navigator.serviceWorker.register"), "the notification service worker must be registered");
	assert.ok(html.includes("showNotification"), "progress/completion notifications must go through the registration");
	assert.ok(html.includes("Notification.requestPermission"), "permission must be requested (on a gesture)");
	assert.ok(html.includes("btn-notify"), "an Enable notifications button must exist for gesture-less auto-starts");
	assert.ok(html.includes("btn-resume"), "a Resume button must exist for interrupted conversions");
	assert.ok(html.includes("btn-ready"), "a Download ready file button must exist for completed stored conversions");
	assert.ok(html.includes("readPartialMeta"), "the page must check OPFS for a previous conversion's state on load");
	assert.ok(html.includes("__rebbeBackground"), "background state must be published for observability");
	assert.ok(html.includes("background: bgState"), "the convert marker must carry the background state");
});

test("conversion worker carries the engine, OPFS per-track persistence and the message protocol", () => {
	const { CONVERT_WORKER_JS } = require("../lib/convert-worker.js");
	assert.ok(CONVERT_WORKER_JS.includes("AudioEncoder"), "worker must encode with WebCodecs");
	assert.ok(CONVERT_WORKER_JS.includes("AudioDecoder"), "worker must decode with WebCodecs");
	assert.ok(CONVERT_WORKER_JS.includes("EncodedAudioChunk"), "decoder input must be WebCodecs chunks");
	assert.ok(CONVERT_WORKER_JS.includes("codec: 'opus'"), "native encoder must be configured for Opus (Chrome has no MP3 encoder)");
	assert.ok(CONVERT_WORKER_JS.includes("demuxOggOpus"), "worker must demux Ogg/Opus itself");
	assert.ok(CONVERT_WORKER_JS.includes("splitMp3Frames"), "worker must split MP3 frames itself");
	assert.ok(CONVERT_WORKER_JS.includes("createOggOpusMuxer"), "worker must mux the Ogg/Opus output");
	assert.ok(CONVERT_WORKER_JS.includes("createSyncAccessHandle"), "finished tracks must persist via OPFS sync handles");
	assert.ok(CONVERT_WORKER_JS.includes("meta.json"), "worker must persist a resume meta record");
	assert.ok(CONVERT_WORKER_JS.includes("track-' + i + '.bin'") || CONVERT_WORKER_JS.includes('track-'), "each finished track must be stored separately");
	assert.ok(CONVERT_WORKER_JS.includes("ack-saved"), "the store must clear only after the page saved the file");
	assert.ok(CONVERT_WORKER_JS.includes("heartbeat"), "worker must heartbeat so the page can detect a dead worker");
	assert.ok(CONVERT_WORKER_JS.includes("ondequeue"), "queue backpressure must be driven by codec dequeue events, not timers");
	new Function(CONVERT_WORKER_JS); // must parse as a standalone script
});

test("service worker handles notification clicks and never intercepts fetches", () => {
	const { SERVICE_WORKER_JS } = require("../lib/service-worker.js");
	assert.ok(SERVICE_WORKER_JS.includes("notificationclick"), "notification clicks must be handled");
	assert.ok(SERVICE_WORKER_JS.includes("clients.matchAll"), "click must focus an existing bundle page");
	assert.ok(SERVICE_WORKER_JS.includes("openWindow"), "click must open the bundle page when none is focused");
	assert.ok(!SERVICE_WORKER_JS.includes("addEventListener('fetch'"), "no fetch interception - downloads stay direct");
	new Function(SERVICE_WORKER_JS); // must parse as a standalone script
});

test("engine muxer supports resume state, page-aligned track parts and skip rollback", () => {
	const { ENGINE_JS } = require("../lib/engine.js");
	assert.ok(ENGINE_JS.includes("skipHeaders"), "muxer must support resuming without rewriting headers");
	assert.ok(ENGINE_JS.includes("flushPage"), "muxer must page-align track boundaries");
	assert.ok(ENGINE_JS.includes("takeParts"), "muxer must hand over per-track parts");
	assert.ok(ENGINE_JS.includes("snapshot") && ENGINE_JS.includes("restore"), "muxer must support skip rollback");
});
