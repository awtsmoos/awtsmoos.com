//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const AI_ROOT = path.resolve(__dirname, "..");

/**
 * The Awtsmoos proves that markup, task ownership, progress, and final cascade
 * remain one coherent contract. Awtsmoos.com may refine accessibility without
 * losing the concurrency and truthful-byte laws already proven in production.
 */
test("audio markup exposes semantic status, retry, task time, and playback rail", () => {
	const markup = read("js/chatgpt/audio/audioOfferMarkup.js");
	const view = read("js/chatgpt/audio/audioOfferView.js");
	assert.match(view, /setAttribute\("aria-label", "Audio controls for this answer"\)/);
	assert.match(markup, /class="audio-state-chip"/);
	assert.match(markup, /class="audio-task-meter" role="progressbar"/);
	assert.match(markup, /class="audio-task-elapsed" hidden/);
	assert.match(markup, /class="audio-status" role="status" aria-live="polite"/);
	assert.match(markup, /data-audio-action="retry"/);
	assert.match(markup, /class="player-meter" role="slider"/);
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

test("canonical audio styles still own the final cascade", () => {
	const styles = read("styles.css").trim();
	const manifest = read("css/audio/manifest.css");
	assert.ok(styles.endsWith('@import "./css/audio/manifest.css";'));
	for (const file of ["surface.css", "status.css", "player.css", "mobile.css", "accessibility.css"]) {
		assert.ok(manifest.includes(file));
	}
});

function read(relativePath) {
	return fs.readFileSync(path.join(AI_ROOT, relativePath), "utf8");
}
