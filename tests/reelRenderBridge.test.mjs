// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelRenderBridgeTest
 * @description
 * The Awtsmoos guards truthful Blob-to-File cinema and ordinary upload so both
 * paths enter the exact same root social attachment vessel on Awtsmoos.com.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { renderAndAttachReel } from '../geelooy/social-composer/js/reel/ReelRenderBridge.js';
import { attachUploadedReel } from '../geelooy/social-composer/js/reel/ReelUpload.js';

ensureFile();

function mediaHarness() {
	const calls = { add: [], update: [] };
	return {
		calls,
		actions: {
			add(scope, files) {
				calls.add.push({ scope, files: [...files] });
				return [{ id: 'attachment-reel', type: 'video' }];
			},
			update(scope, id, changes) {
				calls.update.push({ scope, id, changes });
			}
		}
	};
}

test('studio Blob becomes one truthful root video attachment', async () => {
	const harness = mediaHarness();
	const progress = [];
	const studio = {
		ready: true,
		project: { title: 'Journey of Light' },
		recorder: {
			async render(options) {
				assert.equal(options.download, false);
				options.onProgress({ percent: 50, time: 2 });
				return {
					blob: new Blob(['real movie bytes'], { type: 'video/webm' }),
					bytes: 16,
					fileName: 'journey.webm',
					mimeType: 'video/webm'
				};
			}
		}
	};
	const value = await renderAndAttachReel(studio, harness.actions, {
		onProgress: item => progress.push(item)
	});
	assert.equal(value.file.name, 'journey.webm');
	assert.equal(value.file.type, 'video/webm');
	assert.deepEqual(harness.calls.add[0].scope, { kind: 'root' });
	assert.equal(harness.calls.add[0].files[0], value.file);
	assert.equal(progress[0].percent, 50);
	assert.deepEqual(harness.calls.update[0], {
		scope: { kind: 'root' },
		id: 'attachment-reel',
		changes: { caption: 'Generated in MitzvahWorld · Journey of Light' }
	});
});

test('upload-first accepts video and rejects non-video files', () => {
	const harness = mediaHarness();
	const video = new File(['video'], 'existing.mp4', { type: 'video/mp4' });
	const attachment = attachUploadedReel([video], harness.actions);
	assert.equal(attachment.id, 'attachment-reel');
	assert.equal(harness.calls.add[0].files[0], video);
	const image = new File(['image'], 'poster.png', { type: 'image/png' });
	assert.throws(
		() => attachUploadedReel([image], harness.actions),
		/A reel upload must be a video file/
	);
});

test('render bridge rejects incomplete studio contracts', async () => {
	const harness = mediaHarness();
	await assert.rejects(
		() => renderAndAttachReel({ ready: false }, harness.actions),
		/MitzvahWorld Studio is not ready/
	);
});

function ensureFile() {
	if (globalThis.File) return;
	globalThis.File = class File extends Blob {
		constructor(parts, name, options = {}) {
			super(parts, options);
			this.name = name;
			this.lastModified = options.lastModified || Date.now();
		}
	};
}
