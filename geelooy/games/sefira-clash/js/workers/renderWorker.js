/**
 * B"H
 * Experimental render worker shell.
 *
 * Chapter 251: the worker is a chamber prepared, not forced. The current game
 * uses a safe offscreen backbuffer; this worker waits for an explicit future
 * activation where serialized render packets can be painted away from the main
 * UI thread without stealing DOM control from menus and input.
 */
let canvas = null;
let ctx = null;

self.onmessage = event => {
  const msg = event.data || {};
  if (msg.type === 'init') return init(msg.canvas);
  if (msg.type === 'resize') return resize(msg.width, msg.height, msg.dpr || 1);
  if (msg.type === 'ping') return self.postMessage({ type: 'pong', ok: true });
  if (msg.type === 'frame') return drawDiagnosticFrame(msg.frame || 0);
};

function init(offscreenCanvas) {
  canvas = offscreenCanvas;
  ctx = canvas?.getContext?.('2d', { alpha: false, desynchronized: true }) || null;
  self.postMessage({ type: 'ready', ok: !!ctx });
}

function resize(width, height, dpr) {
  if (!canvas || !ctx) return;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawDiagnosticFrame(frame) {
  if (!ctx || !canvas) return;
  ctx.fillStyle = '#080711';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = '20px system-ui';
  ctx.fillText(`Sefira worker frame ${frame}`, 24, 44);
}
