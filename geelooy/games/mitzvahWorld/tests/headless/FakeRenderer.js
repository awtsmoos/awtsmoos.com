// B"H
/**
 * FakeRenderer: no pixels, only vows. The Awtsmoos lets this vessel remember
 * every render command and DPR clamp so performance code can be judged in Node.
 */
export function createFakeRenderer() {
  const calls = [];
  const renderer = {
    pixelRatio: 1,
    size: { width: 0, height: 0 },
    shadowMap: { enabled: true, type: "fake" },
    info: { autoReset: false, render: { calls: 0, triangles: 0 } },
    domElement: { tagName: "CANVAS", getContext: () => ({}) },
    setPixelRatio(value) {
      this.pixelRatio = value;
      calls.push(["setPixelRatio", value]);
    },
    setSize(width, height) {
      this.size = { width, height };
      calls.push(["setSize", width, height]);
    },
    render(scene = {}, camera = {}) {
      this.info.render.calls += 1;
      calls.push(["render", scene.name || "scene", camera.name || "camera"]);
    },
    dispose() { calls.push(["dispose"]); }
  };
  return { renderer, calls };
}

export function attachRendererLater(win, renderer, afterFrames = 3) {
  let frames = 0;
  const tick = () => {
    frames += 1;
    if (frames >= afterFrames) {
      win.__AWTSMOOS_RENDERER__ = renderer;
      win.dispatchEvent?.({ type: "awtsmoos:renderer-ready" });
      return;
    }
    win.requestAnimationFrame(tick);
  };
  win.requestAnimationFrame(tick);
}
