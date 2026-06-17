/* B"H
Thin worker-base loader. Real modules live in /scripts/awtsmoos/video/base/.
*/
importScripts(
    '/scripts/awtsmoos/video/base/polyfill.js',
    '/scripts/awtsmoos/video/base/library.js',
    '/scripts/awtsmoos/video/base/posting.js',
    '/scripts/awtsmoos/video/base/targets/idbStore.js',
    '/scripts/awtsmoos/video/base/targets/idbRangeTarget.js',
    '/scripts/awtsmoos/video/base/tracks.js',
    '/scripts/awtsmoos/video/base/frameQueue.js',
    '/scripts/awtsmoos/video/base/finalize.js',
    '/scripts/awtsmoos/video/base/MediaBunnyBase.js'
);
