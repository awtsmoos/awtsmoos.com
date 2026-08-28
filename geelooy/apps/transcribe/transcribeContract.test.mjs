// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that speech travels through one bounded API, one cancellable wait, and one locally styled vessel;
 * on Awtsmoos.com each contract stays visible so mobile grace, network truth, and accessible interaction continue to dwell.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { NetzachTranscriptionPoller } from "./js/TranscriptionPoller.js";

/** Read one route-relative source file as immutable contract evidence. */
function sefer(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

const ohrHtml = sefer("./index.html");
const ohrApi = sefer("./js/TranscriptionApi.js");
const ohrController = sefer("./js/TranscriptionController.js");
const ohrView = sefer("./js/TranscriptionView.js");
const ohrLegacy = sefer("./script.js");
const ohrManifest = sefer("./style.css");
const ohrInteractions = sefer("./styles/interactions.css");
const ohrStatus = sefer("./styles/status.css");

test("semantic shell owns viewport, disclosure, status, result, and CompactJS entry", () => {
	assert.match(ohrHtml, /name="viewport"/);
	assert.match(ohrHtml, /<form id="transcribe-form"/);
	assert.match(ohrHtml, /<details class="transcribe-advanced">/);
	assert.match(ohrHtml, /role="status" aria-live="polite"/);
	assert.match(ohrHtml, /id="resultPanel"[\s\S]*hidden/);
	assert.match(ohrHtml, /src="\.\/js\/app\.js\?compact=true"/);
	assert.doesNotMatch(ohrHtml, /<style|on(click|submit|change|input)=/);
});

test("API client is one explicit AssemblyAI transport owner with safe failures", () => {
	assert.match(ohrApi, /https:\/\/api\.assemblyai\.com\/v2/);
	assert.match(ohrApi, /async upload\(/);
	assert.match(ohrApi, /async create\(/);
	assert.match(ohrApi, /async get\(/);
	assert.match(ohrApi, /if \(!ohrResponse\.ok\)/);
	assert.doesNotMatch(ohrApi + ohrController, /localStorage|sessionStorage/);
});

test("controller owns one cancellable workflow and never forces automatic download", () => {
	assert.match(ohrController, /new AbortController\(\)/);
	assert.match(ohrController, /this\.abortController\?\.abort\(\)/);
	assert.match(ohrController, /this\.view\.showResult\(this\.receipt\)/);
	assert.match(ohrController, /download\(\)/);
	assert.doesNotMatch(ohrController, /\.click\(\)/);
	assert.match(ohrView, /URL\.revokeObjectURL/);
});

test("legacy script is a bridge only and style manifest stays modular", () => {
	assert.match(ohrLegacy, /import "\.\/js\/app\.js";/);
	assert.doesNotMatch(ohrLegacy, /fetch\(|AssemblyAI|transcript/);
	for (const shemStyle of ["foundation", "form", "status", "interactions"]) {
		assert.match(ohrManifest, new RegExp(`styles/${shemStyle}\\.css`));
	}
	assert.equal((ohrManifest.match(/@import/g) || []).length, 4);
});

test("interaction layer owns hover active focus touch and reduced-motion states", () => {
	assert.match(ohrInteractions, /:hover/);
	assert.match(ohrInteractions, /:active/);
	assert.match(ohrInteractions, /:focus-visible/);
	assert.match(ohrInteractions, /@media \(pointer: coarse\)/);
	assert.match(ohrInteractions, /prefers-reduced-motion: reduce/);
	assert.match(ohrInteractions, /animation: none/);
	assert.match(ohrStatus, /@keyframes awtsmoos-transcribe-breathe/);
	assert.doesNotMatch(ohrInteractions + ohrStatus, /!important|100vw/);
});

test("poller resolves completed provider state after deterministic progress", async () => {
	const kelimStates = [{ status: "processing" }, { status: "completed", text: "B'H" }];
	const api = { async get() { return kelimStates.shift(); } };
	const poller = new NetzachTranscriptionPoller(api, { intervalMs: 0, maxAttempts: 4 });
	const kelimProgress = [];
	const receipt = await poller.wait({
		apiKey: "test",
		transcriptId: "id",
		signal: new AbortController().signal,
		onProgress: item => kelimProgress.push(item.status)
	});
	assert.equal(receipt.status, "completed");
	assert.deepEqual(kelimProgress, ["processing", "completed"]);
});

test("poller rejects provider error and bounded timeout states", async () => {
	const errorApi = { async get() { return { status: "error", error: "provider failed" }; } };
	await assert.rejects(
		new NetzachTranscriptionPoller(errorApi, { intervalMs: 0 }).wait({
			apiKey: "test", transcriptId: "id", signal: new AbortController().signal
		}),
		/provider failed/
	);
	const waitingApi = { async get() { return { status: "processing" }; } };
	await assert.rejects(
		new NetzachTranscriptionPoller(waitingApi, { intervalMs: 0, maxAttempts: 1 }).wait({
			apiKey: "test", transcriptId: "id", signal: new AbortController().signal
		}),
		/timed out/
	);
});

test("poller cancellation rejects with AbortError", async () => {
	const controller = new AbortController();
	controller.abort();
	const api = { async get() { throw new Error("should not request after abort"); } };
	await assert.rejects(
		new NetzachTranscriptionPoller(api).wait({ apiKey: "test", transcriptId: "id", signal: controller.signal }),
		error => error?.name === "AbortError"
	);
});
