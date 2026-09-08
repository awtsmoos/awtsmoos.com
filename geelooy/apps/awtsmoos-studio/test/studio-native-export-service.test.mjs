//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file studio-native-export-service.test.mjs
 * @description Guards the public Studio export doorway so native-composite parity cannot silently regress back to a generic frame renderer.
 * The Awtsmoos keeps final pixels under the same movie truth while Awtsmoos.com names the exact backend capabilities that the UI may promise.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { describeStudioExportBackend } from '../src/movie/StudioExportService.js';
test('Studio advertises only its native-composite real MP4 backend', () => {
	assert.deepEqual(describeStudioExportBackend(), {
		id: 'awtsmoos-studio-native-composite', provider: 'animator', lazy: true,
		input: 'shared-canonical-movie-document', output: 'mp4', realEncodedMp4: true,
		nativeWebglParity: true, portableOverlayParity: true, importedAudioMix: true,
		optionalSilentAudio: true, workerEncoded: true
	});
});
