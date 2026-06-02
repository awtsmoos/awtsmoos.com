// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./VirtualWebGLTextureArena.js'), require('./VirtualPath2D.js'));
  } else {
    root.Merkava = root.Merkava || {};
    root.Merkava.VirtualCanvas2DContext = factory(root.Merkava, root.Merkava).VirtualCanvas2DContext;
  }
})(typeof self !== 'undefined' ? self : this, function(arenaMod, pathMod) {
  const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;
  const VirtualPath2D = pathMod.VirtualPath2D || class VirtualPath2D { constructor() { this.commands = []; } };

  /**
   * B"H
   * A browser-shaped CanvasRenderingContext2D state machine. It records paint
   * state, paths, transforms, text, image data, gradients, patterns, clipping,
   * compositing, shadows, and draw calls into one Merkava texture arena.
   */
  class VirtualCanvas2DContext {
    constructor(canvas, arena = new VirtualWebGLTextureArena()) {
      this.canvas = canvas;
      this.arena = arena;
      this.texture = canvas.__webglCanvasTexture || arena.createTexture('canvas-2d', canvas, canvas.width || 300, canvas.height || 150);
      canvas.__webglCanvasTexture = this.texture;
      this.__stack = [];
      this.__path = [];
      this.__lineDash = [];
      this.__pixels = new Uint8ClampedArray(Math.max(0, (canvas.width || 300) * (canvas.height || 150) * 4));
      this.__resetState();
    }

    __resetState() {
      this.fillStyle = '#000000';
      this.strokeStyle = '#000000';
      this.font = '10px sans-serif';
      this.globalAlpha = 1;
      this.globalCompositeOperation = 'source-over';
      this.filter = 'none';
      this.lineWidth = 1;
      this.lineCap = 'butt';
      this.lineJoin = 'miter';
      this.miterLimit = 10;
      this.lineDashOffset = 0;
      this.textAlign = 'start';
      this.textBaseline = 'alphabetic';
      this.direction = 'inherit';
      this.shadowColor = 'rgba(0,0,0,0)';
      this.shadowBlur = 0;
      this.shadowOffsetX = 0;
      this.shadowOffsetY = 0;
      this.imageSmoothingEnabled = true;
      this.imageSmoothingQuality = 'low';
      this.__transform = [1, 0, 0, 1, 0, 0];
    }

    state() {
      return {
        fillStyle: encodePaint(this.fillStyle), strokeStyle: encodePaint(this.strokeStyle), font: this.font,
        globalAlpha: this.globalAlpha, globalCompositeOperation: this.globalCompositeOperation, filter: this.filter,
        lineWidth: this.lineWidth, lineCap: this.lineCap, lineJoin: this.lineJoin, miterLimit: this.miterLimit,
        lineDash: this.__lineDash.slice(), lineDashOffset: this.lineDashOffset, textAlign: this.textAlign,
        textBaseline: this.textBaseline, direction: this.direction, shadowColor: this.shadowColor,
        shadowBlur: this.shadowBlur, shadowOffsetX: this.shadowOffsetX, shadowOffsetY: this.shadowOffsetY,
        imageSmoothingEnabled: this.imageSmoothingEnabled, imageSmoothingQuality: this.imageSmoothingQuality,
        transform: this.__transform.slice()
      };
    }

    record(op, data = {}) { return this.arena.record(this.texture, op, { ...data, state: this.state() }); }
    save() { this.__stack.push({ state: this.state(), path: this.__path.map(x => x.slice()) }); this.record('save'); }
    restore() { const old = this.__stack.pop(); if (old) this.__applySaved(old); this.record('restore'); }
    __applySaved(old) { Object.assign(this, old.state); this.__lineDash = old.state.lineDash || []; this.__transform = old.state.transform || [1,0,0,1,0,0]; this.__path = old.path || []; }

    beginPath() { this.__path = []; this.record('beginPath'); }
    closePath() { this.__path.push(['closePath']); this.record('closePath'); }
    moveTo(x, y) { this.__push('moveTo', x, y); }
    lineTo(x, y) { this.__push('lineTo', x, y); }
    rect(x, y, width, height) { this.__push('rect', x, y, width, height); }
    arc(x, y, radius, startAngle, endAngle, anticlockwise = false) { this.__push('arc', x, y, radius, startAngle, endAngle, !!anticlockwise); }
    arcTo(x1, y1, x2, y2, radius) { this.__push('arcTo', x1, y1, x2, y2, radius); }
    ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise = false) { this.__push('ellipse', x, y, radiusX, radiusY, rotation, startAngle, endAngle, !!anticlockwise); }
    quadraticCurveTo(cpx, cpy, x, y) { this.__push('quadraticCurveTo', cpx, cpy, x, y); }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) { this.__push('bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y); }
    roundRect(x, y, width, height, radii = 0) { const r = normalizeRadii(radii); this.__path.push(['roundRect', n(x), n(y), n(width), n(height), r]); this.record('roundRect', { x:n(x), y:n(y), width:n(width), height:n(height), radii:r }); }
    addPath(path) { if (path?.commands) this.__path.push(...path.commands.map(item => item.slice())); this.record('addPath', { count: path?.commands?.length || 0 }); }
    __push(op, ...values) { const nums = values.map(v => typeof v === 'boolean' ? v : n(v)); this.__path.push([op, ...nums]); this.record(op, objectFromValues(op, nums)); }

    fill(path, fillRule = 'nonzero') { this.record('fillPath', { path: this.__pathArg(path), fillRule }); }
    stroke(path) { this.record('strokePath', { path: this.__pathArg(path) }); }
    clip(path, fillRule = 'nonzero') { this.record('clip', { path: this.__pathArg(path), fillRule }); }
    isPointInPath(path, x, y) { this.record('isPointInPath', { x:n(arguments.length === 2 ? path : x), y:n(arguments.length === 2 ? x : y) }); return false; }
    isPointInStroke(path, x, y) { this.record('isPointInStroke', { x:n(arguments.length === 2 ? path : x), y:n(arguments.length === 2 ? x : y) }); return false; }

    clearRect(x, y, width, height) { this.record('clearRect', rectData(x, y, width, height)); }
    fillRect(x, y, width, height) { this.record('fillRect', { ...rectData(x, y, width, height), fillStyle: encodePaint(this.fillStyle) }); }
    strokeRect(x, y, width, height) { this.record('strokeRect', { ...rectData(x, y, width, height), strokeStyle: encodePaint(this.strokeStyle) }); }

    fillText(text, x, y, maxWidth) { const run = this.__textRun(text, x, y, maxWidth, 'fill'); this.canvas.ownerDocument?.fontAtlas?.recordText(run); this.record('fillTextPlaceholder', run); }
    strokeText(text, x, y, maxWidth) { const run = this.__textRun(text, x, y, maxWidth, 'stroke'); this.record('strokeTextPlaceholder', run); }
    measureText(text) { return this.canvas.ownerDocument?.fontAtlas?.measure(text, this.font) || fallbackMeasure(text, this.font); }

    drawImage(image, ...args) { this.record('drawImageTexture', { sourceTexture: image?.__webglCanvasTexture?.id ?? image?.__webglBoxTexture?.id ?? null, imageWidth: image?.width || 0, imageHeight: image?.height || 0, ...imageBox(image, args) }); }
    createImageData(widthOrData, height, settings = {}) { return makeImageData(widthOrData, height, undefined, settings); }
    getImageData(x, y, width, height, settings = {}) { this.record('getImageData', { x:n(x), y:n(y), width:n(width), height:n(height), settings }); return makeImageData(n(width), n(height), undefined, settings); }
    putImageData(imageData, dx, dy, dirtyX = 0, dirtyY = 0, dirtyWidth = imageData?.width || 0, dirtyHeight = imageData?.height || 0) { this.record('putImageData', { dx:n(dx), dy:n(dy), dirtyX:n(dirtyX), dirtyY:n(dirtyY), dirtyWidth:n(dirtyWidth), dirtyHeight:n(dirtyHeight), bytes:imageData?.data?.length || 0 }); }

    createLinearGradient(x0, y0, x1, y1) { return gradient('linear', { x0:n(x0), y0:n(y0), x1:n(x1), y1:n(y1) }); }
    createRadialGradient(x0, y0, r0, x1, y1, r1) { return gradient('radial', { x0:n(x0), y0:n(y0), r0:n(r0), x1:n(x1), y1:n(y1), r1:n(r1) }); }
    createConicGradient(startAngle, x, y) { return gradient('conic', { startAngle:n(startAngle), x:n(x), y:n(y) }); }
    createPattern(image, repetition = 'repeat') { return { kind:'pattern', image, repetition, sourceTexture:image?.__webglCanvasTexture?.id ?? null, toString:() => '[object CanvasPattern]' }; }

    translate(x, y) { this.__transform = multiply(this.__transform, [1,0,0,1,n(x),n(y)]); this.record('translate', { x:n(x), y:n(y) }); }
    rotate(angle) { const c = Math.cos(n(angle)), s = Math.sin(n(angle)); this.__transform = multiply(this.__transform, [c,s,-s,c,0,0]); this.record('rotate', { angle:n(angle) }); }
    scale(x, y) { this.__transform = multiply(this.__transform, [n(x) || 1,0,0,n(y) || 1,0,0]); this.record('scale', { x:n(x), y:n(y) }); }
    transform(a, b, c, d, e, f) { this.__transform = multiply(this.__transform, [n(a),n(b),n(c),n(d),n(e),n(f)]); this.record('transform', { a:n(a), b:n(b), c:n(c), d:n(d), e:n(e), f:n(f) }); }
    setTransform(a, b, c, d, e, f) { this.__transform = arguments.length === 1 && a?.a != null ? [n(a.a),n(a.b),n(a.c),n(a.d),n(a.e),n(a.f)] : arguments.length ? [n(a),n(b),n(c),n(d),n(e),n(f)] : [1,0,0,1,0,0]; this.record('setTransform', { transform:this.__transform.slice() }); }
    resetTransform() { this.__transform = [1,0,0,1,0,0]; this.record('resetTransform'); }
    getTransform() { const [a,b,c,d,e,f] = this.__transform; return { a,b,c,d,e,f, is2D:true, toJSON(){ return { a,b,c,d,e,f }; } }; }

    setLineDash(value = []) { this.__lineDash = Array.from(value).map(n); this.record('setLineDash', { value:this.__lineDash }); }
    getLineDash() { return this.__lineDash.slice(); }
    reset() { this.__resetState(); this.beginPath(); this.record('reset'); }
    snapshot() { return this.texture; }
    __pathArg(path) { return path instanceof VirtualPath2D ? path.commands.map(item => item.slice()) : this.__path.map(item => item.slice()); }
    __textRun(text, x, y, maxWidth, mode) { return { text:String(text), x:n(x), y:n(y), maxWidth:maxWidth == null ? null : n(maxWidth), font:this.font, mode, fillStyle:encodePaint(this.fillStyle), strokeStyle:encodePaint(this.strokeStyle), metrics:this.measureText(String(text)) }; }
  }

  function rectData(x, y, width, height) { return { x:n(x), y:n(y), width:n(width), height:n(height) }; }
  function objectFromValues(op, values) { const keys = { moveTo:['x','y'], lineTo:['x','y'], rect:['x','y','width','height'], arc:['x','y','radius','startAngle','endAngle','anticlockwise'], arcTo:['x1','y1','x2','y2','radius'], ellipse:['x','y','radiusX','radiusY','rotation','startAngle','endAngle','anticlockwise'], quadraticCurveTo:['cpx','cpy','x','y'], bezierCurveTo:['cp1x','cp1y','cp2x','cp2y','x','y'] }[op] || []; return Object.fromEntries(keys.map((key, i) => [key, values[i]])); }
  function n(value) { const out = Number(value); return Number.isFinite(out) ? out : 0; }
  function normalizeRadii(radii) { return (Array.isArray(radii) ? radii : [radii]).map(v => typeof v === 'object' ? { x:n(v.x), y:n(v.y) } : { x:n(v), y:n(v) }); }
  function gradient(kind, data) { return { kind, stops: [], ...data, addColorStop(offset, color) { this.stops.push({ offset:n(offset), color:String(color) }); }, toString() { return `[object CanvasGradient:${kind}]`; } }; }
  function encodePaint(paint) { return typeof paint === 'object' ? { ...paint, image: undefined } : String(paint); }
  function fallbackMeasure(text, font) { const size = Number(String(font).match(/(\d+(?:\.\d+)?)px/)?.[1] || 10); return { width:String(text).length * size * 0.62, actualBoundingBoxAscent:size * 0.8, actualBoundingBoxDescent:size * 0.2, font, source:'fallback' }; }
  function imageBox(image, args) { if (args.length <= 2) return { x:n(args[0]), y:n(args[1]), width:n(image?.width), height:n(image?.height) }; if (args.length <= 4) return { x:n(args[0]), y:n(args[1]), width:n(args[2]), height:n(args[3]) }; return { sx:n(args[0]), sy:n(args[1]), sw:n(args[2]), sh:n(args[3]), x:n(args[4]), y:n(args[5]), width:n(args[6]), height:n(args[7]) }; }
  function multiply(m, n2) { return [m[0]*n2[0]+m[2]*n2[1], m[1]*n2[0]+m[3]*n2[1], m[0]*n2[2]+m[2]*n2[3], m[1]*n2[2]+m[3]*n2[3], m[0]*n2[4]+m[2]*n2[5]+m[4], m[1]*n2[4]+m[3]*n2[5]+m[5]]; }
  function makeImageData(widthOrData, width, height, settings = {}) { if (widthOrData?.buffer || ArrayBuffer.isView(widthOrData)) return { data: new Uint8ClampedArray(widthOrData), width:n(width), height:n(height), colorSpace:settings.colorSpace || 'srgb' }; return { data: new Uint8ClampedArray(Math.max(0, n(widthOrData) * n(width) * 4)), width:n(widthOrData), height:n(width), colorSpace:settings.colorSpace || 'srgb' }; }
  return { VirtualCanvas2DContext };
});
