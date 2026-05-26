// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./SyntheticBrowserRuntime.js'), require('./RuntimeLog.js'), require('./IncrementalDomCompiler.js'), require('./RetainedLayoutEngine.js'), require('./EventRoutingEngine.js'), require('./WebGLBytecodeCompiler.js'), require('./TextLayoutEngine.js'));
  else { root.Merkava = root.Merkava || {}; root.Merkava.PersistentBrowserRuntime = factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava).PersistentBrowserRuntime; }
})(typeof self !== 'undefined' ? self : this, function(runtimeMod, logMod, domMod, layoutMod, eventMod, webglMod, textMod) {
  const SyntheticBrowserRuntime = runtimeMod.SyntheticBrowserRuntime;
  const RuntimeLog = logMod.RuntimeLog;
  const IncrementalDomCompiler = domMod.IncrementalDomCompiler;
  const RetainedLayoutEngine = layoutMod.RetainedLayoutEngine;
  const EventRoutingEngine = eventMod.EventRoutingEngine;
  const WebGLBytecodeCompiler = webglMod.WebGLBytecodeCompiler;
  const TextLayoutEngine = textMod.TextLayoutEngine;

  class PersistentBrowserRuntime {
    constructor(options = {}) {
      this.synthetic = new SyntheticBrowserRuntime(options);
      this.window = this.synthetic.window;
      this.log = options.log || new RuntimeLog('persistent-browser');
      this.dom = new IncrementalDomCompiler(this.window.document, { log: this.log });
      this.layout = new RetainedLayoutEngine(this.window.document, { log: this.log });
      this.events = new EventRoutingEngine(this.window, this.layout, { log: this.log });
      this.webgl = new WebGLBytecodeCompiler({ log: this.log });
      this.text = new TextLayoutEngine({ log: this.log });
      this.frames = [];
    }
    pushHtml(chunk, final = false) { return this.dom.pushChunk(chunk, final); }
    appendHtml(selector, html) { const parent = this.window.document.querySelector(selector) || this.window.document.body; return this.dom.appendHtml(parent, html); }
    frame(viewport = { width: 760, height: 600 }) {
      const started = Date.now();
      const tree = this.layout.layout(viewport);
      const snapshot = this.window.renderWebGLDom();
      const renderOps = snapshot.commands.length + this.layout.ops.length;
      const summary = { treeNodes: countTree(tree), layoutOps: this.layout.ops.length, renderOps, invalidations: this.dom.invalidations.length, frameMs: Date.now() - started };
      this.log.push('render', 'emitted', { BOX: this.layout.ops.filter(x => x.op === 'layoutBox').length, TEXT: this.layout.ops.filter(x => x.op === 'layoutText').length });
      this.log.push('executor', 'frame', { frameMs: summary.frameMs });
      this.frames.push(summary);
      return { tree, snapshot, summary, log: this.log.text() };
    }
    pointer(type, x, y) { return this.events.pointer(type, x, y); }
    keyboard(type, key) { return this.events.keyboard(type, key); }
    compileWebGLDemo() {
      const vs = this.webgl.createShader('vertex', 'attribute vec2 p; void main(){gl_Position=vec4(p,0.0,1.0);}');
      this.webgl.compileShader(vs);
      const fs = this.webgl.createShader('fragment', 'void main(){gl_FragColor=vec4(1.0);}');
      this.webgl.compileShader(fs);
      const program = this.webgl.createProgram();
      this.webgl.attachShader(program, vs); this.webgl.attachShader(program, fs); this.webgl.linkProgram(program); this.webgl.useProgram(program);
      const buffer = this.webgl.createBuffer(); this.webgl.bindBuffer('ARRAY_BUFFER', buffer); this.webgl.bufferData('ARRAY_BUFFER', new Float32Array([0,0, 1,0, 0,1]));
      const texture = this.webgl.createTexture(); this.webgl.texImage2D(texture, 32, 32, 4096); this.webgl.uniform('u_color', [1,0,0,1]); this.webgl.drawArrays('TRIANGLES', 0, 3);
      return { ops: this.webgl.ops, bytes: this.webgl.toBytecode().length };
    }
    shapeText(text, style, width) { return this.text.shape(text, style, width); }
    report() { return { frames: this.frames, dom: this.dom.summary(), webglOps: this.webgl.ops.length, textAtlasGlyphs: this.text.atlas.size, log: this.log.text() }; }
  }
  function countTree(node) { return node ? 1 + (node.children || []).reduce((n, c) => n + countTree(c), 0) : 0; }
  return { PersistentBrowserRuntime };
});
