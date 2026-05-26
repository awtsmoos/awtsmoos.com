// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualHtmlHydrator.js'), require('./RuntimeLog.js'));
  else { root.Merkava = root.Merkava || {}; root.Merkava.IncrementalDomCompiler = factory(root.Merkava, root.Merkava).IncrementalDomCompiler; }
})(typeof self !== 'undefined' ? self : this, function(hydratorMod, logMod) {
  const VirtualHtmlHydrator = hydratorMod.VirtualHtmlHydrator;
  const RuntimeLog = logMod.RuntimeLog;

  class IncrementalDomCompiler {
    constructor(document, options = {}) {
      this.document = document;
      this.log = options.log || new RuntimeLog('incremental-dom');
      this.hydrator = new VirtualHtmlHydrator();
      this.buffer = '';
      this.mutations = [];
      this.invalidations = [];
      this.scripts = [];
      this.createdNodes = 0;
      this.startedAt = Date.now();
    }
    pushChunk(chunk, final = false) {
      this.buffer += String(chunk || '');
      this.log.push('hydrate', 'chunk', { bytes: Buffer.byteLength(String(chunk || ''), 'utf8'), final });
      if (!final) return { ok: true, pendingBytes: this.buffer.length, final: false };
      const before = countNodes(this.document.documentElement);
      const result = this.hydrator.hydrate(this.document, this.buffer);
      const after = countNodes(this.document.documentElement);
      this.createdNodes = Math.max(0, after - before);
      this.scripts = collectScripts(this.document);
      this.invalidate(this.document.body, 'final-hydrate');
      this.log.push('hydrate', 'createdNodes', { count: after, delta: this.createdNodes, ms: Date.now() - this.startedAt });
      this.log.push('script', 'ordered', { count: this.scripts.length });
      return { ...result, pendingBytes: 0, final: true, scripts: this.scripts.length };
    }
    recordMutation(kind, node, parent = null) {
      const item = { kind, node: describe(node), parent: describe(parent || node?.parentNode), at: Date.now() };
      this.mutations.push(item);
      this.log.push('dom', `${kind} ${item.node} -> ${item.parent}`);
      this.invalidate(parent || node, kind);
      return item;
    }
    invalidate(node, reason = 'mutation') {
      const item = { subtree: describe(node), reason, at: Date.now() };
      this.invalidations.push(item);
      this.log.push('layout', 'invalidated', { subtree: item.subtree, reason });
      return item;
    }
    appendHtml(parent, html) {
      const tempDocument = new this.document.constructor();
      this.hydrator.hydrate(tempDocument, `<body>${html}</body>`);
      const moved = [];
      while (tempDocument.body.firstChild) {
        const child = tempDocument.body.firstChild;
        parent.appendChild(child);
        moved.push(child);
        this.recordMutation('appendChild', child, parent);
      }
      return moved;
    }
    summary(renderOps = null) {
      return { createdNodes: countNodes(this.document.documentElement), mutations: this.mutations.length, invalidations: this.invalidations.length, scripts: this.scripts.length, renderOps };
    }
  }
  function countNodes(node) { return node ? 1 + (node.children || []).reduce((n, child) => n + countNodes(child), 0) : 0; }
  function collectScripts(document) { return document.head.querySelectorAll?.('script').concat(document.body.querySelectorAll?.('script') || []) || []; }
  function describe(node) { if (!node) return 'null'; const tag = node.localName || node.tagName || 'node'; return `${tag}${node.id ? '#' + node.id : ''}${node.className ? '.' + String(node.className).trim().replace(/\s+/g, '.') : ''}`; }
  return { IncrementalDomCompiler };
});
