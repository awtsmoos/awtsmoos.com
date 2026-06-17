/* B"H
Thin piano video worker loader. Real modules live in ./video-worker/.
*/
importScripts(
    '/scripts/awtsmoos/video/mediabunny-worker-base.js',
    './video-worker/constants.js',
    './video-worker/state.js',
    './video-worker/layout.js',
    './video-worker/keyCache.js',
    './video-worker/effects.js',
    './video-worker/effectRender.js',
    './video-worker/keyDrawing.js',
    './video-worker/frameDrawing.js',
    './video-worker/renderLoop.js',
    './video-worker/messages.js'
);
