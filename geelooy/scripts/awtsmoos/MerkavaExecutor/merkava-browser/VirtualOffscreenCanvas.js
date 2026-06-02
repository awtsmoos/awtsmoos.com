// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./VirtualCanvas2DContext.js'), require('./VirtualWebGLContext.js'), require('./VirtualWebGLTextureArena.js'));
  } else {
    root.Merkava = root.Merkava || {};
    root.Merkava.VirtualOffscreenCanvas = factory(root.Merkava, root.Merkava, root.Merkava).VirtualOffscreenCanvas;
    root.Merkava.VirtualImageData = factory(root.Merkava, root.Merkava, root.Merkava).VirtualImageData;
  }
})(typeof self !== 'undefined' ? self : this, function(canvas2dMod, webglMod, arenaMod) {
  const VirtualCanvas2DContext = canvas2dMod.VirtualCanvas2DContext;
  const VirtualWebGLContext = webglMod.VirtualWebGLContext;
  const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;

  /**
   * B"H
   * OffscreenCanvas is the hidden altar where glyphs, workers, and canvas
   * pipelines can draw without a DOM element. It shares the same texture arena
   * contract as HTMLCanvasElement so snapshots do not care where pixels began.
   */
  class VirtualOffscreenCanvas {
    constructor(width = 300, height = 150, ownerDocument = null, arena = null) {
      this.localName = 'canvas';
      this.tagName = 'OFFSCREENCANVAS';
      this.nodeType = 1;
      this.ownerDocument = ownerDocument || null;
      this.width = positiveInt(width, 300);
      this.height = positiveInt(height, 150);
      this.textureArena = arena || ownerDocument?.textureArena || new VirtualWebGLTextureArena();
      this.__webglCanvasTexture = null;
      this.__canvas2dContext = null;
      this.__webglContext = null;
    }

    getContext(kind, options = {}) {
      const type = String(kind || '').toLowerCase();
      if (type === '2d') return this.__canvas2dContext ||= new VirtualCanvas2DContext(this, this.textureArena, options);
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return this.__webglContext ||= new VirtualWebGLContext(this, this.textureArena, options);
      return null;
    }

    convertToBlob(options = {}) {
      const type = String(options.type || 'image/png');
      const payload = JSON.stringify({ kind: 'VirtualOffscreenCanvasBlob', width: this.width, height: this.height, type });
      const BlobCtor = typeof Blob !== 'undefined' ? Blob : class Blob { constructor(parts, init) { this.parts = parts; this.type = init?.type || ''; this.size = parts.join('').length; } };
      return Promise.resolve(new BlobCtor([payload], { type }));
    }

    transferToImageBitmap() {
      return new VirtualImageBitmap(this.width, this.height, this.__webglCanvasTexture, this.textureArena.snapshot());
    }

    toJSON() {
      return { kind: 'OffscreenCanvas', width: this.width, height: this.height, texture: this.__webglCanvasTexture?.id ?? null };
    }
  }

  class VirtualImageBitmap {
    constructor(width, height, texture = null, snapshot = null) {
      this.width = width;
      this.height = height;
      this.__webglCanvasTexture = texture;
      this.snapshot = snapshot;
      this.closed = false;
    }
    close() { this.closed = true; }
  }

  class VirtualImageData {
    constructor(dataOrWidth, width, height, options = {}) {
      if (typeof dataOrWidth === 'number') {
        this.width = positiveInt(dataOrWidth, 0);
        this.height = positiveInt(width, 0);
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      } else {
        this.data = dataOrWidth instanceof Uint8ClampedArray ? dataOrWidth : new Uint8ClampedArray(dataOrWidth || []);
        this.width = positiveInt(width, 0);
        this.height = positiveInt(height, Math.floor(this.data.length / Math.max(1, this.width * 4)));
      }
      this.colorSpace = options.colorSpace || 'srgb';
    }
  }

  function positiveInt(value, fallback) {
    const n = Math.floor(Number(value));
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  return { VirtualOffscreenCanvas, VirtualImageBitmap, VirtualImageData };
});
