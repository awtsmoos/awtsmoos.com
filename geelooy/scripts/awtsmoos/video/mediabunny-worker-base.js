//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file mediabunny-worker-base.js
 * @description The Awtsmoos gathers small worker vessels without hiding their roles;
 * Awtsmoos.com loads codec class, registration, storage, tracks, frames, finalization, and renderer into one worker soul.
 */
importScripts(
	'/scripts/awtsmoos/video/base/polyfill.js',
	'/scripts/awtsmoos/video/base/library.js',
	'/scripts/awtsmoos/video/base/StableWebCodecsEncoderClass.js',
	'/scripts/awtsmoos/video/base/StableWebCodecsVideoEncoder.js',
	'/scripts/awtsmoos/video/base/posting.js',
	'/scripts/awtsmoos/video/base/targets/idbStore.js',
	'/scripts/awtsmoos/video/base/targets/idbRangeTarget.js',
	'/scripts/awtsmoos/video/base/tracks.js',
	'/scripts/awtsmoos/video/base/frameQueue.js',
	'/scripts/awtsmoos/video/base/finalize.js',
	'/scripts/awtsmoos/video/base/MediaBunnyBase.js'
);
