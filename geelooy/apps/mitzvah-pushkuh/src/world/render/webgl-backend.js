// B"H
/**
 * WebGL backend: one texture atlas can now carry named sprite regions.
 * The broader render graph remains Canvas-oriented, but command sprites may
 * already reduce texture binds through a packed atlas covenant.
 */
import { buildAtlasCanvas } from "./atlas-canvas.js";
import { BACKEND_FEATURES, normalizeBackend } from "./backend-contract.js";
import { createDebugCounters } from "./debug-counters.js";
import { createGLState } from "./gl/state.js";
import { createRectPipeline } from "./gl/rect-pipeline.js";
import { createSpritePipeline } from "./gl/sprite-pipeline.js";
import { createTextureRegistry } from "./gl/texture-registry.js";
import { renderQuality } from "./quality-ladder.js";
import { executeWebGLCommands } from "./webgl-commands.js";

export function createWebGLBackend(canvas, opts = {}) {
  const gl = canvas.getContext("webgl", webglOptions());
  if (!gl) return null;
  const quality = renderQuality(opts.quality), state = createGLState(gl), textures = createTextureRegistry(gl), counters = createDebugCounters();
  const pipelines = { rects: createRectPipeline(gl, state), sprites: createSpritePipeline(gl, state, textures, quality.maxSprites) };
  const stats = { drawn: 0, skipped: 0, total: 0, sorted: 0, uploads: 0, textureBinds: 0 };
  function resize(w, h) { canvas.width = w; canvas.height = h; state.setViewport(w, h); }
  function begin() { counters.reset(); gl.clearColor(.02, 0, .06, 1); gl.clear(gl.COLOR_BUFFER_BIT); return null; }
  function execute(buffer) { return Object.assign(stats, counters.set({ ...executeWebGLCommands(gl, buffer, pipelines, quality), ...textureStats() })); }
  function prepareAtlas(atlas) {
    const packed = buildAtlasCanvas(atlas);
    if (!packed.ready) return packed;
    for (const name of packed.layout.names()) textures.register(name, packed.canvas, { uv: packed.layout.get(name), atlas: true });
    return packed;
  }
  function atlasLayout(atlas) { return buildAtlasCanvas(atlas).layout; }
  function textureStats() { const s = textures.stats(); return { uploads: s.uploads, textureBinds: s.binds }; }
  function end() {}
  return normalizeBackend({ kind: "webgl", gl, resize, begin, execute, end, stats, counters, prepareAtlas, atlasLayout, capabilities: capabilities(gl) }, { features: [BACKEND_FEATURES.rects, BACKEND_FEATURES.sprites, BACKEND_FEATURES.atlas] });
}
function webglOptions() { return { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, premultipliedAlpha: true }; }
function capabilities(gl) { return { maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE), rectPipeline: true, spritePipeline: true, instancing: !!gl.getExtension("ANGLE_instanced_arrays") }; }
