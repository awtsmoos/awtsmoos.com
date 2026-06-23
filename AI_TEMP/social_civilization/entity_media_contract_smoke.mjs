// B"H
import assert from 'node:assert/strict';
import { assetKind, normalizeAsset, normalizeAssets } from '../../geelooy/scripts/awtsmoos/social/media/mediaManifest.js';
import { renderAsset } from '../../geelooy/scripts/awtsmoos/social/media/renderAsset.js';
import { renderGallery, renderStructuredMedia } from '../../geelooy/scripts/awtsmoos/social/media/renderGallery.js';
import { hasEntityMedia, renderEntityMedia } from '../../geelooy/scripts/awtsmoos/social/media/renderEntityMedia.js';

const image = { id: 'img', type: 'image', publicPath: '/i.png', originalName: 'i.png' };
const audio = { id: 'aud', mime: 'audio/wav', publicPath: '/a.wav', originalName: 'a.wav', audioNoteText: 'heard' };
const video = { id: 'vid', contentType: 'video/mp4', url: '/v.mp4', name: 'v.mp4' };
const note = { id: 'note', assets: [audio] };
const entity = { id: 'entity', media: [image], notes: [note], sections: [{ id: 'section', assets: [video], segments: [{ id: 'segment', assets: [audio] }] }] };

assert.equal(assetKind(image), 'image');
assert.equal(assetKind(audio), 'audio');
assert.equal(assetKind(video), 'video');
assert.equal(normalizeAsset(image).url, '/i.png');
assert.equal(normalizeAssets(JSON.stringify([image])).length, 1);
assert.ok(renderAsset(image).includes('<img'));
assert.ok(renderAsset(audio).includes('<audio'));
assert.ok(renderAsset(video).includes('<video'));
assert.ok(renderGallery([image, audio]).includes('bh-social-gallery'));
assert.ok(renderStructuredMedia(entity).includes('segment'));
assert.equal(hasEntityMedia(entity), true);
assert.ok(renderEntityMedia(entity).includes('bh-social-gallery'));
assert.ok(renderEntityMedia(entity).includes('heard'));

console.log(JSON.stringify({ BH: 'B"H', pass: true, checks: ['manifest', 'asset', 'gallery', 'entity'] }, null, 2));
