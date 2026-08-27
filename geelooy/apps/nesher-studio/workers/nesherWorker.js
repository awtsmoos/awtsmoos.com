/* B"H
Thin studio worker loader. The shared Awtsmoos video base is the spine.
*/
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');
const Api = { initialize:'INITIALIZE_RENDERER', frame:'ADD_CANVAS_FRAME', finalize:'FINALIZE_MUXING' };
let renderer;

async function drawBitmap({ ctx, canvas }, frame) {
  ctx.drawImage(frame.bitmap, 0, 0, canvas.width, canvas.height);
  frame.bitmap.close();
}

async function initializeRenderer(payload) {
  renderer = new self.MediaBunnyBase(payload, drawBitmap, { libraryPath: payload.libraryPath || '/scripts/awtsmoos/video/mediabunny-library.js' });
  await renderer.start();
}

self.onmessage = async event => {
  const { type, payload } = event.data;
  try {
    if (type === Api.initialize) await initializeRenderer(payload);
    else if (type === Api.frame && renderer) await renderer.addFrame(payload);
    else if (type === Api.finalize && renderer) {
      const blob = await renderer.finalize(payload);
      renderer._postComplete(blob, {});
    }
  } catch (error) {
    payload?.bitmap?.close?.();
    self.AwtsVideoBase.postFatalError('Video worker failed: ' + (error?.message || error), error);
  }
};
