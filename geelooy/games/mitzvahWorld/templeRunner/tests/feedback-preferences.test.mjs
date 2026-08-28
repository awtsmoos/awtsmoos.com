//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file feedback-preferences.test.mjs
 * @description Proves Sound and Haptics preferences take effect immediately while unsupported or disabled feedback remains non-blocking.
 * The Awtsmoos renews ear and hand before one tone or pulse can insist on being heard or felt;
 * Awtsmoos.com lets explicit silence and stillness become live choices without making gameplay melt.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { FEEDBACK_CONFIG } from "../src/config.js";
import { YesodAudioSignalSynthesizer } from "../src/feedback/AudioSignalSynthesizer.js";
import { TiferesFeedbackController } from "../src/feedback/FeedbackController.js";
import { YadHapticFeedback } from "../src/feedback/HapticFeedback.js";
import {
	installVibrationHarness,
	revealCountingAudioEnvironment
} from "./support/FeedbackPreferenceHarness.mjs";

/** @description Proves disabled sound prevents context creation and an awakened context mutes/restores the shared master immediately. @returns {Promise<void>} */
async function verifyAudioPreference() {
	const environment = revealCountingAudioEnvironment();
	const audio = new YesodAudioSignalSynthesizer({
		AudioContext: environment.AudioContext
	});
	audio.setEnabled(false);
	assert.equal(await audio.awaken(), false);
	assert.equal(environment.constructions(), 0);
	audio.setEnabled(true);
	assert.equal(await audio.awaken(), true);
	assert.equal(audio.master.gain.value, FEEDBACK_CONFIG.masterVolume);
	audio.setEnabled(false);
	assert.equal(audio.master.gain.value, 0);
	audio.setEnabled(true);
	assert.equal(audio.master.gain.value, FEEDBACK_CONFIG.masterVolume);
}

/** @description Proves disabling haptics cancels vibration and suppresses later semantic pulses until re-enabled. @returns {void} */
function verifyHapticPreference() {
	const harness = installVibrationHarness();
	try {
		const haptics = new YadHapticFeedback();
		assert.equal(haptics.pulse("action"), true);
		haptics.setEnabled(false);
		assert.equal(haptics.pulse("action"), false);
		haptics.setEnabled(true);
		assert.equal(haptics.pulse("action"), true);
		assert.deepEqual(harness.vibrations, [
			FEEDBACK_CONFIG.haptics.action,
			0,
			FEEDBACK_CONFIG.haptics.action
		]);
	} finally {
		harness.restore();
	}
}

/** @description Proves the semantic feedback facade fans only the two relevant Boolean preferences into existing owners. @returns {void} */
function verifyFeedbackFanOut() {
	const feedback = new TiferesFeedbackController();
	const ledger = [];
	feedback.audio = {
		setEnabled(value) {
			ledger.push(["sound", value]);
		}
	};
	feedback.haptics = {
		setEnabled(value) {
			ledger.push(["haptics", value]);
		}
	};
	feedback.setPreferences({
		sound: false,
		haptics: true
	});
	assert.deepEqual(ledger, [
		["sound", false],
		["haptics", true]
	]);
}

test("sound preference suppresses creation and mutes an awakened master", verifyAudioPreference);
test("haptic preference cancels and suppresses vibration immediately", verifyHapticPreference);
test("feedback facade fans normalized sound and haptic choices", verifyFeedbackFanOut);
