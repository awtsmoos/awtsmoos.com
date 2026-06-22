// B"H
import assert from 'node:assert/strict';
import { createAttachmentState } from '../../geelooy/scripts/awtsmoos/social/media/attachmentState.js';
import { renderAsset, isImageAsset, isAudioAsset } from '../../geelooy/scripts/awtsmoos/social/media/renderAsset.js';
import { renderGallery, renderStructuredMedia } from '../../geelooy/scripts/awtsmoos/social/media/renderGallery.js';
import { renderVoiceNote } from '../../geelooy/scripts/awtsmoos/social/media/renderVoiceNote.js';

const image = { id: 'img1', type: 'image', mime: 'image/png', publicPath: '/api/social/assets/a/image/img1.png', originalName: 'a.png', size: 10 };
const audio = { id: 'aud1', type: 'audio', mime: 'audio/wav', publicPath: '/api/social/assets/a/audio/aud1.wav', originalName: 'a.wav', size: 12 };
assert.equal(isImageAsset(image), true);
assert.equal(isAudioAsset(audio), true);
assert.ok(renderAsset(image).includes('<img'));
assert.ok(renderAsset(audio).includes('<audio'));
assert.ok(renderGallery([image, audio]).includes('bh-social-gallery'));
assert.ok(renderStructuredMedia({ rootAssets: [image], sections: [{ assets: [image], segments: [{ assets: [audio] }] }] }).includes('aud1'));
assert.ok(renderVoiceNote({ audioNoteText: 'spoken', assets: [audio] }).includes('spoken'));
const state = createAttachmentState();
let count = 0;
state.onChange(items => { count = items.length; });
state.add(image);
state.add(audio);
assert.equal(count, 2);
state.remove(image.id);
assert.equal(state.list().length, 1);
console.log(JSON.stringify({ BH: 'B"H', pass: true, checks: ['image', 'audio', 'gallery', 'structured', 'voice', 'state'] }, null, 2));
