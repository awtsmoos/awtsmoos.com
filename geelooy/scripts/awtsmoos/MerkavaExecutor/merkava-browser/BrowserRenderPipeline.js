// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./RetainedLayoutEngine.js'));
  else { root.Merkava = root.Merkava || {}; root.Merkava.BrowserRenderPipeline = factory(root.Merkava).BrowserRenderPipeline; }
})(typeof self !== 'undefined' ? self : this, function(layoutMod) {
  const RetainedLayoutEngine = layoutMod.RetainedLayoutEngine;

  /**
   * Chapter 1: The Awtsmoos opens the furnace under the painted page.
   *
   * This is the first architectural throat of the miniature Chromium path:
   * computed style and layout are asked for before paint, paint is captured as
   * a retained display list, and the native host receives only primitive ops.
   * Existing canvas/WebGL commands are preserved because page script may paint
   * before DOM compositing; the pipeline must compose history, not erase it.
   *
   * @class BrowserRenderPipeline
   */
  class BrowserRenderPipeline {
    constructor(window, options = {}) {
      this.window = window;
      this.document = window.document;
      this.renderer = options.renderer;
      this.viewport = options.viewport || { width: 760, height: 560 };
      this.layoutEngine = new RetainedLayoutEngine(this.document);
    }

    /**
     * Runs the explicit browser pipeline and returns a retained render snapshot.
     *
     * @returns {{textures: object[], commands: object[], pipeline: object}}
     */
    render() {
      const beforePaint = this.document.textureArena.commands.length;
      const layoutTree = this.layoutEngine.layout(this.viewport);
      this.renderer.paintElement(this.document.body, 0, 0, this.viewport.width, this.viewport.height);
      const gpuSnapshot = this.document.textureArena.snapshot();
      const displayList = buildDisplayList(gpuSnapshot.commands);
      return {
        ...gpuSnapshot,
        pipeline: {
          architecture: 'merkava-executor-retained-pipeline-v1',
          phases: ['computed-style', 'layout-tree', 'display-list', 'paint-order', 'native-gpu-stream'],
          viewport: this.viewport,
          preservedCommandCount: beforePaint,
          layoutRoot: summarizeLayout(layoutTree),
          layoutOps: this.layoutEngine.ops,
          displayList,
          commandCount: gpuSnapshot.commands.length
        }
      };
    }
  }

  function buildDisplayList(commands) {
    return commands.filter(command => command.op !== 'createTexture').map((command, index) => ({
      id: index,
      op: normalizePaintOp(command.op),
      sourceOp: command.op,
      texture: command.texture ?? null,
      bounds: boundsOf(command),
      payload: command
    }));
  }

  function normalizePaintOp(op) {
    const map = {
      paintBox: 'DRAW_BACKGROUND', paintBorder: 'DRAW_BORDER', paintTextPlaceholder: 'DRAW_TEXT_RUN',
      paintImageTexture: 'DRAW_IMAGE', paintBackgroundImage: 'DRAW_IMAGE', paintGradient: 'DRAW_GRADIENT',
      paintShadow: 'DRAW_SHADOW', paintClipPush: 'PUSH_CLIP', paintClipPop: 'POP_CLIP',
      paintOpacity: 'SET_OPACITY', paintTransform: 'SET_TRANSFORM', paintBorderRadius: 'SET_RADIUS'
    };
    return map[op] || op;
  }

  function boundsOf(command) {
    return { x: num(command.x), y: num(command.y), width: num(command.width), height: num(command.height) };
  }

  function summarizeLayout(node) {
    if (!node) return null;
    return { tag: node.tag, id: node.id, x: node.x, y: node.y, width: node.width, height: node.height, children: (node.children || []).length };
  }

  function num(value) { return Number.isFinite(Number(value)) ? Number(value) : 0; }

  return { BrowserRenderPipeline };
});
