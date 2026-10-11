// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    // B"H (startup): canvas/WebGL contexts cost ~160ms to load and most
    // pages never touch a canvas. Load lazily on first getContext() call.
    const lazyRequire = path => {
      let mod = null;
      return new Proxy({}, {
        get(t, prop) {
          if (typeof prop === "symbol") return undefined;
          if (!mod) mod = require(path);
          return mod[prop];
        }
      });
    };
    module.exports = factory(lazyRequire('./VirtualCanvas2DContext.js'), lazyRequire('./VirtualWebGLContext.js'), require('./VirtualWebGLTextureArena.js'));
  } else {
    root.Merkava = root.Merkava || {};
    root.Merkava.VirtualOffscreenCanvas = factory(root.Merkava, root.Merkava, root.Merkava).VirtualOffscreenCanvas;
    root.Merkava.VirtualImageData = factory(root.Merkava, root.Merkava, root.Merkava).VirtualImageData;
  }
})(typeof self !== 'undefined' ? self : this, function(canvas2dMod, webglMod, arenaMod) {
  // B"H (startup): canvas2dMod/webglMod are lazy proxies — do NOT destructure
  // here (that would trigger the load). Access .VirtualCanvas2DContext etc.
  // inside getContext() only.
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
      if (type === '2d') return this.__canvas2dContext ||= new canvas2dMod.VirtualCanvas2DContext(this, this.textureArena, options);
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return this.__webglContext ||= new webglMod.VirtualWebGLContext(this, this.textureArena, options);
      return null;
    }

    convertToBlob(options = {}) {
      const type = String(options.type || 'image/png');
      const png = this.__encodePng();
      const BlobCtor = typeof Blob !== 'undefined' ? Blob : class Blob { constructor(parts, init) { this.parts = parts; this.type = init?.type || ''; this.size = parts.join('').length; } };
      return Promise.resolve(new BlobCtor([png], { type }));
    }

    // B"H 2026-10-09 (readback): REAL toDataURL. Rasterizes the 2d context
    // (or WebGL drawing buffer) and PNG-encodes. The encode path is the same
    // one the snapshot renderer uses (already 23-40x optimized).
    toDataURL(type = 'image/png', quality) {
      const png = this.__encodePng();
      if (typeof Buffer !== 'undefined') return `data:image/png;base64,${png.toString('base64')}`;
      let bin = '';
      for (let i = 0; i < png.length; i++) bin += String.fromCharCode(png[i]);
      return `data:image/png;base64,${btoa(bin)}`;
    }

    __encodePng() {
      const w = Math.max(1, this.width), h = Math.max(1, this.height);
      let rgba = null;
      if (this.__canvas2dContext && typeof this.__canvas2dContext.__rasterize === 'function') {
        rgba = this.__canvas2dContext.__rasterize().data;
      } else if (this.__webglContext && this.__webglContext.drawingBuffer) {
        rgba = this.__webglContext.drawingBuffer.color;
      }
      if (!this.__pngTools && typeof require === 'function') {
        try { this.__pngTools = require('../merkava-service/snapshots/pngTools.js'); } catch (e) { this.__pngTools = null; }
      }
      if (!rgba) rgba = new Uint8ClampedArray(w * h * 4);
      if (this.__pngTools && this.__pngTools.rgbPngFromRgba) {
        // B"H 2026-10-09 (readback): level 1 deflate — 58x faster encode,
        // slightly larger file. Speed is the product here.
        return this.__pngTools.rgbPngFromRgba(rgba, w, h, { level: 1 });
      }
      // Minimal fallback: raw RGBA wrapped as Buffer (non-browser env without pngTools).
      return typeof Buffer !== 'undefined' ? Buffer.from(rgba) : rgba;
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
