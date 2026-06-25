// B"H
/**
 * The sprite pipeline now understands named atlas regions.
 * A raw image still survives for Canvas and fallback, but a name can summon
 * one packed texture and precise UVs, reducing binds as sparks multiply.
 */
import { createProgram, locationMap, uniformMap } from "./shader.js";

const VERT = `
attribute vec2 a_position;
attribute vec2 a_uv;
attribute float a_alpha;
uniform vec2 u_resolution;
varying vec2 v_uv;
varying float v_alpha;
void main() {
  vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_uv = a_uv; v_alpha = a_alpha;
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_uv;
varying float v_alpha;
void main() { gl_FragColor = texture2D(u_texture, v_uv) * v_alpha; }`;

export function createSpritePipeline(gl, state, registry, capacity = 1024) {
  const program = createProgram(gl, VERT, FRAG), attrs = locationMap(gl, program, ["a_position", "a_uv", "a_alpha"]);
  const uniforms = uniformMap(gl, program, ["u_resolution", "u_texture"]), stride = 5, vertsPerSprite = 6, floatsPerSprite = 30;
  const data = new Float32Array(capacity * floatsPerSprite), buffer = gl.createBuffer();
  let count = 0, activeRecord = null, activeMode = "source-over", width = 1, height = 1;
  function begin(w, h) { width = w; height = h; count = 0; activeRecord = null; activeMode = "source-over"; }
  function push(c) {
    const record = c.name ? registry.getNamed(c.name) || registry.get(c.img) : registry.get(c.img);
    if (!record) return false;
    if (count >= capacity || activeRecord?.texture !== record.texture || activeMode !== (c.mode || "source-over")) flush();
    activeRecord = record; activeMode = c.mode || "source-over"; writeSprite(c, record.uv || FULL_UV); count++; return true;
  }
  function flush() {
    if (!count || !activeRecord) return 0;
    bind(); state.setBlend(activeMode); gl.activeTexture(gl.TEXTURE0); registry.bind(activeRecord); gl.uniform1i(uniforms.u_texture, 0);
    gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, count * floatsPerSprite), gl.STREAM_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, count * vertsPerSprite);
    const drawn = count; count = 0; return drawn;
  }
  function bind() {
    state.useProgram(program); state.bindArrayBuffer(buffer); gl.uniform2f(uniforms.u_resolution, width, height);
    gl.enableVertexAttribArray(attrs.a_position); gl.enableVertexAttribArray(attrs.a_uv); gl.enableVertexAttribArray(attrs.a_alpha);
    gl.vertexAttribPointer(attrs.a_position, 2, gl.FLOAT, false, stride * 4, 0); gl.vertexAttribPointer(attrs.a_uv, 2, gl.FLOAT, false, stride * 4, 8);
    gl.vertexAttribPointer(attrs.a_alpha, 1, gl.FLOAT, false, stride * 4, 16);
  }
  function writeSprite(c, uv) {
    const x = c.x, y = c.y, x2 = x + c.w, y2 = y + c.h, a = c.alpha ?? 1, o = count * floatsPerSprite;
    v(o, x, y, uv.u0, uv.v0, a); v(o + stride, x2, y, uv.u1, uv.v0, a); v(o + stride * 2, x, y2, uv.u0, uv.v1, a);
    v(o + stride * 3, x, y2, uv.u0, uv.v1, a); v(o + stride * 4, x2, y, uv.u1, uv.v0, a); v(o + stride * 5, x2, y2, uv.u1, uv.v1, a);
  }
  function v(i, x, y, u, vv, a) { data[i] = x; data[i + 1] = y; data[i + 2] = u; data[i + 3] = vv; data[i + 4] = a; }
  return { begin, push, flush };
}
const FULL_UV = Object.freeze({ u0: 0, v0: 0, u1: 1, v1: 1 });
