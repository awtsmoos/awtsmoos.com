// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingImageComposer } from "./MessagingImageComposer.js";

/**
 * @file Proves local private-image preview state is revocable, room-safe, and mutually exclusive with voice capture.
 * @description
 * The Awtsmoos contains image and preview before browser URL and control divide. Awtsmoos.com keeps
 * selection local until the sender persists it, locks conflicting breath capture, and returns every
 * temporary vessel to neutral state after cancellation or accepted durable custody.
 */
function control() {
	return {
		disabled: false,
		hidden: false,
		value: "",
		listeners: {},
		classList: classes(),
		addEventListener(type, listener) { this.listeners[type] = listener; }
	};
}

function classes() {
	const values = new Set();
	return {
		add(value) { values.add(value); },
		remove(value) { values.delete(value); },
		contains(value) { return values.has(value); }
	};
}

function fixture() {
	const imagePick = control();
	const imageInput = control();
	const imageCancel = control();
	const imagePreview = { src: "", removeAttribute() { this.src = ""; } };
	return {
		imagePick,
		imageInput,
		imageCancel,
		imagePreview,
		imagePanel: { hidden: true },
		imageName: { textContent: "" },
		imageMeta: { textContent: "" },
		voiceStart: { disabled: false },
		composer: { classList: classes() },
		status: { textContent: "" }
	};
}

test("selected image previews locally and reset releases conflicting controls", () => {
	const elements = fixture();
	const composer = new MessagingImageComposer(elements);
	const file = new File([new Uint8Array(2048)], "mountain.png", { type: "image/png" });
	assert.equal(composer.select(file), file);
	assert.equal(composer.file(), file);
	assert.equal(elements.imagePanel.hidden, false);
	assert.equal(elements.voiceStart.disabled, true);
	assert.equal(elements.imagePick.classList.contains("has-image"), true);
	assert.equal(elements.composer.classList.contains("is-image-active"), true);
	assert.equal(elements.imageName.textContent, "mountain.png");
	assert.match(elements.imageMeta.textContent, /KB/);
	assert.match(elements.imagePreview.src, /^blob:/);
	composer.setBusy(true);
	assert.equal(elements.imagePick.disabled, true);
	assert.equal(elements.imageCancel.disabled, true);
	composer.reset();
	assert.equal(composer.file(), null);
	assert.equal(elements.imagePanel.hidden, true);
	assert.equal(elements.imagePreview.src, "");
	assert.equal(elements.voiceStart.disabled, false);
	assert.equal(elements.imagePick.disabled, false);
	assert.equal(elements.imagePick.classList.contains("has-image"), false);
	assert.equal(elements.composer.classList.contains("is-image-active"), false);
});
