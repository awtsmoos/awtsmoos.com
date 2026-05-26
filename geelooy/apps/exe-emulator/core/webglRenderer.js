// B"H
/**
 * Native WebGL fallback for virtual GDI/OpenGL-style drawing.
 * It turns symbolic draw operations into GPU lines/triangles when available.
 * @param {HTMLCanvasElement} canvas drawing target
 * @returns {{draw:(op:object)=>boolean}}
 */
export function createWebGlRenderer(canvas) {
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return { draw: () => false };
  const program = makeProgram(gl);
  const buffer = gl.createBuffer();
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const pos = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  gl.clearColor(0.02, 0.04, 0.08, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return {
    draw(op) {
      if (op.type === 'pixel-line') return drawLine(gl, buffer);
      if (op.type === 'triangle') return drawTriangle(gl, buffer);
      if (op.type === 'opengl-triangles') return drawOpenGlTriangles(gl, buffer, op);
      if (op.type === 'text') return drawTextOverlay(canvas, op);
      return false;
    }
  };
}

function drawLine(gl, buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.85, 0.75, 0.85, -0.75]), gl.STATIC_DRAW);
  gl.drawArrays(gl.LINES, 0, 2);
  return true;
}

function drawTriangle(gl, buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0.78, -0.78, -0.72, 0.78, -0.72]), gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  return true;
}

function drawOpenGlTriangles(gl, buffer, op) {
  const verts = (op.vertices || []).flatMap(v => [clamp(v.x / 120), clamp(v.y / 120)]);
  if (verts.length < 6) return false;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, Math.floor(verts.length / 2));
  return true;
}

function drawTextOverlay(canvas, op) {
  const label = document.createElement('div');
  label.className = 'webgl-label';
  label.textContent = op.text || '';
  canvas.insertAdjacentElement('afterend', label);
  return true;
}

function clamp(n) {
  return Math.max(-1, Math.min(1, n));
}

function makeProgram(gl) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, 'attribute vec2 a_position; void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }');
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, 'precision mediump float; void main(){ gl_FragColor = vec4(0.1, 0.9, 1.0, 1.0); }');
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}
