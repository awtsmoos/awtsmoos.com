// B"H
/**
 * Rectangles descend as six triangles of speech.
 * The pipeline rebinds at every flush, because another stream may have sung
 * between begin and draw; the GPU altar must always know which vessel speaks.
 */
import { createProgram, locationMap, uniformMap } from "./shader.js";

const VERT = `
attribute vec2 a_position;
attribute vec4 a_color;
uniform vec2 u_resolution;
varying vec4 v_color;
void main() {
  vec2 zeroToOne = a_position / u_resolution;
  vec2 clip = zeroToOne * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_color = a_color;
}`;

const FRAG = `
precision mediump float;
varying vec4 v_color;
void main() { gl_FragColor = v_color; }`;

export function createRectPipeline(gl, state, capacity = 2048) {
  const program = createProgram(gl, VERT, FRAG);
  const attrs = locationMap(gl, program, ["a_position", "a_color"]);
  const uniforms = uniformMap(gl, program, ["u_resolution"]);
  const stride = 6, verticesPerRect = 6, floatsPerRect = stride * verticesPerRect;
  const data = new Float32Array(capacity * floatsPerRect), buffer = gl.createBuffer();
  let count = 0, activeMode = "source-over", width = 1, height = 1;
  function begin(w, h) { width = w; height = h; count = 0; activeMode = "source-over"; }
  function push(c) { if (count >= capacity || c.mode !== activeMode) flush(); activeMode = c.mode || "source-over"; writeRect(c); count++; }
  function flush() {
    if (!count) return 0;
    bind(); state.setBlend(activeMode);
    gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, count * floatsPerRect), gl.STREAM_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, count * verticesPerRect);
    const drawn = count; count = 0; return drawn;
  }
  function bind() {
    state.useProgram(program); state.bindArrayBuffer(buffer); gl.uniform2f(uniforms.u_resolution, width, height);
    gl.enableVertexAttribArray(attrs.a_position); gl.enableVertexAttribArray(attrs.a_color);
    gl.vertexAttribPointer(attrs.a_position, 2, gl.FLOAT, false, stride * 4, 0);
    gl.vertexAttribPointer(attrs.a_color, 4, gl.FLOAT, false, stride * 4, 8);
  }
  function writeRect(c) {
    const x = c.x, y = c.y, r = rgba(c.fill, c.alpha), x2 = x + c.w, y2 = y + c.h, o = count * floatsPerRect;
    writeVertex(o, x, y, r); writeVertex(o + stride, x2, y, r); writeVertex(o + stride * 2, x, y2, r);
    writeVertex(o + stride * 3, x, y2, r); writeVertex(o + stride * 4, x2, y, r); writeVertex(o + stride * 5, x2, y2, r);
  }
  function writeVertex(i, x, y, r) { data[i] = x; data[i + 1] = y; data[i + 2] = r[0]; data[i + 3] = r[1]; data[i + 4] = r[2]; data[i + 5] = r[3]; }
  return { begin, push, flush };
}

function rgba(fill = "#ffffff", alpha = 1) {
  if (fill[0] !== "#") return [1, 1, 1, alpha];
  const n = parseInt(fill.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, alpha ?? 1];
}
