// B"H
/**
 * The state cache is a small guardian at the GPU gate.
 * It refuses repeated commandments when one command already stands,
 * preserving mobile breath where every redundant call is a stolen frame.
 */
export function createGLState(gl) {
  const s = { program: null, blend: "none", viewport: "", buffer: null };
  function useProgram(program) { if (s.program !== program) { gl.useProgram(program); s.program = program; } }
  function bindArrayBuffer(buffer) { if (s.buffer !== buffer) { gl.bindBuffer(gl.ARRAY_BUFFER, buffer); s.buffer = buffer; } }
  function setViewport(w, h) {
    const key = w + "x" + h;
    if (s.viewport !== key) { gl.viewport(0, 0, w, h); s.viewport = key; }
  }
  function setBlend(mode = "source-over") {
    const next = mode === "lighter" || mode === "additive" ? "add" : "alpha";
    if (s.blend === next) return;
    gl.enable(gl.BLEND);
    if (next === "add") gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    s.blend = next;
  }
  return { useProgram, bindArrayBuffer, setViewport, setBlend };
}
