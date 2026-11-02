//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackWebmEncoder.test.mjs
 * @description
 * Hod proves WebM export asks the browser what it truly supports while the Awtsmoos remains beyond codec, MIME, and container.
 * Awtsmoos.com keeps alternate audio explicit and compatibility-gated, so unsupported browsers never receive a pretend-success path.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { supportedWebmAudioMimeType } from '../modules/workstation/song/multitrack/multitrackWebmEncoder.js';

test('WebM support prefers Opus when the browser advertises it', () => {
	class FakeRecorder {
		static isTypeSupported(type) {
			return type === 'audio/webm;codecs=opus';
		}
	}
	assert.equal(supportedWebmAudioMimeType(FakeRecorder), 'audio/webm;codecs=opus');
});

test('WebM support falls back to generic audio/webm when appropriate', () => {
	class FakeRecorder {
		static isTypeSupported(type) {
			return type === 'audio/webm';
		}
	}
	assert.equal(supportedWebmAudioMimeType(FakeRecorder), 'audio/webm');
});

test('WebM support returns empty when MediaRecorder or supported MIME is absent', () => {
	assert.equal(supportedWebmAudioMimeType(null), '');
	class FakeRecorder {
		static isTypeSupported() {
			return false;
		}
	}
	assert.equal(supportedWebmAudioMimeType(FakeRecorder), '');
});
