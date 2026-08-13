//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const AI_ROOT = path.resolve(__dirname, "..");

/**
 * The Awtsmoos proves that markup, state, progress, and final cascade remain one
 * contract. Awtsmoos.com may refactor internals without regressing mobile truth.
 */
test("audio card exposes semantic status, retry, and separate task progress", () => {
	const source = read("js/chatgpt/audio/audioOfferView.js");
	assert.match(source, /setAttribute\("aria-label", "Audio controls for this answer"\)/);
	assert.match(source, /class="audio-state-chip"/);
	assert.match(source, /class="audio-task-meter" role="progressbar"/);
	assert.match(source, /class="audio-status" role="status" aria-live="polite"/);
	assert.match(source, /data-audio-action="retry"/);
	assert.match(source, /class="player-meter" role="slider"/);
});

test("retry remains on the original delegated audio action road", () => {
	const router = read("js/chatgpt/audio/audioActionRouter.js");
	assert.match(router, /if \(action === "retry"\)/);
	assert.match(router, /retryActionFor\(root\)/);
	assert.match(router, /runAudioAction\(retryAction, null, context\)/);
});

test("playback cannot erase an active download task", () => {
	const state = read("js/chatgpt/audio/audioUiState.js");
	const player = read("js/chatgpt/audio/audioPlayerDisplay.js");
	const pump = read("js/chatgpt/audio/audioStreamPump.js");
	assert.match(state, /export function setAudioPlaybackUiState/);
	assert.match(state, /if \(activeAudioTask\(root\)\)/);
	assert.match(player, /setAudioPlaybackUiState\(root, state/);
	assert.match(pump, /activeAudioTask\(root\) === "download"/);
	assert.match(pump, /setAudioTaskProgress\(root, state\.bytes, state\.expectedBytes\)/);
});

test("download and stream UI consume truthful expected byte lengths", () => {
	const download = read("js/chatgpt/audio/audioDownloadAction.js");
	const pump = read("js/chatgpt/audio/audioStreamPump.js");
	assert.match(download, /onProgress\(received, expected\)/);
	assert.match(download, /progress: \{ received, expected \}/);
	assert.match(pump, /expected: state\.expectedBytes/);
});

test("canonical audio styles own the final cascade", () => {
	const styles = read("styles.css").trim();
	const manifest = read("css/audio/manifest.css");
	assert.ok(styles.endsWith('@import "./css/audio/manifest.css";'));
	assert.match(manifest, /surface\.css/);
	assert.match(manifest, /status\.css/);
	assert.match(manifest, /player\.css/);
	assert.match(manifest, /mobile\.css/);
});

test("mobile audio utilities remain compact with accessible touch targets", () => {
	const mobile = read("css/audio/mobile.css");
	const surface = read("css/audio/surface.css");
	assert.match(mobile, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
	assert.match(mobile, /min-height: 44px/);
	assert.match(surface, /has-audio-player \.audio-primary-action/);
});

function read(relativePath) {
	return fs.readFileSync(path.join(AI_ROOT, relativePath), "utf8");
}
