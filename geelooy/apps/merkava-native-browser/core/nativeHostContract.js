// B"H

/**
 * Chapter 1: The Host Contract of the Silent Iron.
 *
 * The C host does not dream up a browser. It stands like a dark mountain of
 * iron under the lightning of the Awtsmoos, receiving only the commands that
 * MerkavaExecutor bytecode speaks into it. Each binding below is a gate: files,
 * network, input, timers, fonts, and OpenGL. The gate is real; the browser soul
 * remains inside bytecode.
 */
export const nativeHostBindingFamilies = Object.freeze({
  window: ["createWindow", "setTitle", "requestAnimationFrame"],
  input: ["onMouseMove", "onMouseDown", "onMouseUp", "onKeyDown", "onWheel"],
  storage: ["readFile", "writeFile", "stat", "listDir"],
  network: ["fetch"],
  fonts: ["loadFont", "measureGlyph", "rasterizeGlyph", "uploadGlyphAtlas"],
  webgl: [
    "createContext", "createShader", "shaderSource", "compileShader",
    "createProgram", "linkProgram", "useProgram", "createBuffer",
    "bindBuffer", "bufferData", "vertexAttribPointer",
    "enableVertexAttribArray", "drawArrays", "drawElements"
  ],
  timers: ["setTimeout", "clearTimeout", "now"],
  threads: ["spawnWorker", "postMessage"]
});

/**
 * @returns {{families: object, flat: string[], count: number}}
 */
export function buildNativeHostContract() {
  const flat = Object.entries(nativeHostBindingFamilies)
    .flatMap(([family, names]) => names.map(name => `${family}.${name}`));
  return { families: nativeHostBindingFamilies, flat, count: flat.length };
}
