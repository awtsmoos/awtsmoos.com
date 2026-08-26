// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that a powerful cover-maker stays simple, mobile, truthful, and explicit at every boundary;
 * Awtsmoos.com keeps preview separate from export while the compact entry carries a spacious modular source world soundly.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { OhrCoverModel, PIXELS_PER_INCH } from "./js/model.js";

const read = relative => readFileSync(new URL(relative, import.meta.url), "utf8");
const html = read("./index.html");
const foundation = read("./styles/foundation.css");
const formManifest = read("./styles/form.css");
const formFields = read("./styles/form-fields.css");
const formActions = read("./styles/form-actions.css");
const previewCss = read("./styles/preview.css");
const interactions = read("./styles/interactions.css");
const app = read("./js/app.js");
const images = read("./js/images.js");
const renderer = read("./js/renderer.js");
const download = read("./js/download.js");

test("shell is mobile-first, externalized, and compact-entry driven", () => {
	assert.match(html, /name="viewport"[^>]*viewport-fit=cover/);
	assert.match(html, /href="\.\/style\.css"/);
	assert.match(html, /src="\.\/js\/app\.js\?compact=true"/);
	assert.doesNotMatch(html, /<style\b/i);
	assert.doesNotMatch(html, /onclick=/i);
	assert.doesNotMatch(html, /<script(?![^>]*src=)/i);
});

test("advanced sizing is folded and export is explicit", () => {
	assert.match(html, /<details class="advanced-controls">/);
	assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
	assert.match(html, /id="generate-cover"[^>]*type="submit"/);
	assert.match(html, /id="download-cover"[^>]*type="button"[^>]*disabled/);
	assert.match(html, /role="status" aria-live="polite"/);
});

test("cover model preserves 96 pixels per inch and validates the spec", () => {
	assert.equal(PIXELS_PER_INCH, 96);
	const spec = new OhrCoverModel().createSpec({
		title: "Light",
		subtitle: "Hidden",
		width: "6",
		height: "9",
		files: [{}]
	});
	assert.equal(spec.widthPixels, 576);
	assert.equal(spec.heightPixels, 864);
	assert.throws(() => new OhrCoverModel().createSpec({ title: "", width: 6, height: 9, files: [{}] }));
});

test("temporary image and export URLs are always revoked", () => {
	assert.match(images, /URL\.createObjectURL/);
	assert.match(images, /URL\.revokeObjectURL/);
	assert.match(images, /image\.onerror/);
	assert.match(download, /canvas\.toBlob/);
	assert.match(download, /URL\.revokeObjectURL/);
});

test("preview generation never performs export", () => {
	assert.doesNotMatch(renderer, /download|toBlob|toDataURL/i);
	assert.match(app, /renderer\.render/);
	assert.match(app, /downloader\.download/);
	assert.match(app, /invalidateRender/);
	assert.doesNotMatch(app + renderer, /alert\(/);
});

test("canvas and page geometry remain bounded on mobile", () => {
	assert.match(foundation, /min-height:\s*100dvh/);
	assert.match(foundation, /safe-area-inset-top/);
	assert.match(previewCss, /#coverCanvas[\s\S]*max-width:\s*100%/);
	assert.match(previewCss, /#coverCanvas[\s\S]*height:\s*auto/);
	assert.match(previewCss, /\.preview-stage[\s\S]*overflow:\s*auto/);
	assert.doesNotMatch(foundation + formFields + formActions + previewCss, /width:\s*50%/);
});

test("form cascade and interaction language remain modular and complete", () => {
	assert.match(formManifest, /form-fields\.css/);
	assert.match(formManifest, /form-actions\.css/);
	assert.match(formFields, /min-height:\s*46px/);
	assert.match(formActions, /\.cover-button[\s\S]*min-height:\s*46px/);
	assert.match(interactions, /\.cover-button:not\(:disabled\):hover/);
	assert.match(interactions, /\.cover-button:not\(:disabled\):active/);
	assert.match(interactions, /focus-visible/);
	assert.match(interactions, /prefers-reduced-motion:\s*reduce/);
	assert.doesNotMatch(interactions, /animation:\s*[^;]*infinite/);
});
