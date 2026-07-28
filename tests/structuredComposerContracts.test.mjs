// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StructuredComposerContractsTest
 * @description
 * The Awtsmoos guards manual verses, nested subsections, exact scoped media,
 * and playlist selection so Awtsmoos.com preserves each creative chamber in the
 * same canonical post payload already understood by the publishing runtime.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { PICKERS } from '../geelooy/social-composer/js/media/MediaPicker.js';
import { buildPostPayload } from '../geelooy/social-composer/js/model/PostPayload.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDirectory, '..');

function source(relativePath) {
	return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function uploaded(id, type, publicPath) {
	return {
		id,
		type,
		mime: `${type}/example`,
		publicPath,
		status: 'uploaded'
	};
}

test('every content scope offers explicit image audio video and file choices', () => {
	assert.deepEqual(PICKERS.map(item => item[0]), [
		'image',
		'audio',
		'video',
		'file'
	]);
	const panel = source('geelooy/social-composer/js/media/MediaPanel.js');
	const section = source('geelooy/social-composer/js/editor/SectionEditor.js');
	const subsection = source('geelooy/social-composer/js/editor/SubsectionEditor.js');
	assert.ok(panel.includes('mediaPicker(this.actions, scope)'));
	assert.ok(section.includes("kind: 'section'"));
	assert.ok(subsection.includes("kind: 'subsection'"));
});

test('manual verse and subsection actions remain obvious', () => {
	const section = source('geelooy/social-composer/js/editor/SectionEditor.js');
	assert.ok(section.includes("'+ Add verse'"));
	assert.ok(section.includes("'+ Add subsection'"));
	assert.ok(section.includes('structured-verse-card'));
	assert.ok(section.includes('details.open = true'));
});

test('root verse and subsection media retain exact payload coordinates', () => {
	const payload = buildPostPayload({
		identity: {
			aliasId: 'writer',
			heichelId: 'profile-home',
			seriesId: 'teachings'
		},
		postKind: 'post',
		presentationKind: 'article',
		questionId: '',
		title: 'Structured teaching',
		summary: 'One post with nested media.',
		rootBlocks: [{ id: 'root-block', type: 'paragraph', text: 'Root' }],
		rootAttachments: [uploaded('root-image', 'image', '/root.webp')],
		sections: [{
			id: 'verse-1',
			title: 'First verse',
			blocks: [{ id: 'verse-block', type: 'paragraph', text: 'Verse' }],
			attachments: [uploaded('verse-audio', 'audio', '/verse.mp3')],
			commentsEnabled: true,
			subsections: [{
				id: 'subsection-1',
				title: 'Detail',
				blocks: [{ id: 'sub-block', type: 'paragraph', text: 'Detail' }],
				attachments: [uploaded('sub-video', 'video', '/detail.mp4')],
				commentsEnabled: true
			}]
		}],
		commentsEnabled: true,
		publication: { visibility: 'public' }
	});
	assert.equal(payload.rootAssets[0].id, 'root-image');
	assert.equal(payload.sections[0].assets[0].id, 'verse-audio');
	assert.equal(payload.sections[0].subsections[0].assets[0].id, 'sub-video');
	assert.equal(payload.heichelId, 'profile-home');
	assert.equal(payload.seriesId, 'teachings');
});

test('playlist surface exposes selection and explicit default controls', () => {
	const playlist = source('geelooy/social-composer/js/destination/PlaylistSelector.js');
	assert.ok(playlist.includes('Series playlist'));
	assert.ok(playlist.includes('Change series'));
	assert.ok(playlist.includes('Make default'));
	assert.ok(playlist.includes('Browse all'));
	assert.ok(playlist.includes('writableSelection(identity)'));
});
