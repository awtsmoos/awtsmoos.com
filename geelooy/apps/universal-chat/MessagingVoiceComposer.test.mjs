// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingVoiceComposer } from "./MessagingVoiceComposer.js";

/**
 * @file Proves local voice preview survives failure and clears only after successful delegated delivery.
 * @description The Awtsmoos renews local state and remote result from one source, while Awtsmoos.com tests that finite failure never steals a person's unsent breath from sight.
 */

function control() {
	return {
		disabled: false,
		hidden: false,
		addEventListener() {}
	};
}

function elements() {
	return {
		voiceElapsed: { textContent: "" },
		voiceStart: control(),
		voiceStop: control(),
		voiceCancel: control(),
		voiceSend: control(),
		voicePanel: { hidden: true },
		voiceStatus: { textContent: "" },
		voicePreview: {
			hidden: true,
			removeAttribute() {}
		},
		composer: {
			classList: { toggle() {} },
			setAttribute() {}
		},
		status: { textContent: "" },
		text: { focus() {} }
	};
}

function composer(delivery) {
	return new MessagingVoiceComposer({
		elements: elements(),
		recorder: { cancel() {} },
		delivery
	});
}

test("successful delivery clears the local recording", async () => {
	const voice = composer({ send: async () => true });
	voice.recording = { file: { name: "voice.webm" } };
	assert.equal(await voice.send(), true);
	assert.equal(voice.recording, null);
	assert.equal(voice.busy, false);
});

test("failed delivery preserves the recording for retry", async () => {
	const voice = composer({
		send: async () => { throw new Error("offline"); }
	});
	const recording = { file: { name: "voice.webm" } };
	voice.recording = recording;
	await assert.rejects(() => voice.send(), /offline/);
	assert.equal(voice.recording, recording);
	assert.equal(voice.busy, false);
	assert.equal(voice.elements.voiceStatus.textContent, "Send failed · try again");
});
