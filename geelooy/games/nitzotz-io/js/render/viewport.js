// B"H

/** B"H: The canvas receives its size each instant like a garment of light. */
export function resizeCanvas(canvas, gl, fx, postfx = false) {
  const d = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(innerWidth * d));
  canvas.height = Math.max(1, Math.floor(innerHeight * d));
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  gl.viewport(0, 0, canvas.width, canvas.height);
  fx.resize(canvas.width, canvas.height, postfx);
}
