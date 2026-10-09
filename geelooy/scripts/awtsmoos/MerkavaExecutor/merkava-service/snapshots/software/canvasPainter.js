// B"H
/**
 * @file canvasPainter.js
 * @description
 * Canvas 2D command replay with real pixel semantics: transforms,
 * globalAlpha, Porter-Duff composite ops, clip regions, gradient fills,
 * canvas shadows, and canvas-source drawImage pixel replay.
 *
 * Each 2D canvas texture is rasterized into its own transparent offscreen
 * surface (real alpha preserved), then composited onto the page surface.
 * The recorded per-command state (transform, globalAlpha,
 * globalCompositeOperation, shadow*) is honored for every draw call.
 */
import { cssColor, Framebuffer, boxBlurRegion } from './framebuffer.js';
import { paintWebgl } from './canvas-painter/webglWitness.js';

const IDENT = [1, 0, 0, 1, 0, 0];
const COMPOSITE_OPS = new Set([
  'source-over', 'source-in', 'source-out', 'source-atop',
  'destination-over', 'destination-in', 'destination-out', 'destination-atop',
  'lighter', 'copy', 'xor'
]);

export function paintCanvasTexture(fb, texture, box, allTextures = []) {
  if (!texture || !box) return;
  const webgl = texture.kind === 'canvas-webgl';
  fb.fillRect(box.x, box.y, box.w, box.h, webgl ? [19, 14, 55, 255] : [8, 38, 46, 255]);
  fb.strokeRect(box.x, box.y, box.w, box.h, [74, 220, 255, 255], 2);
  const inner = inset(box, 8);
  if (webgl) paintWebgl(fb, texture, inner);
  else paint2d(fb, texture, inner, allTextures, new Set([texture.id]));
}

// Render one canvas texture into a standalone RGBA surface at its own
// pixel size. Used for canvas-source drawImage (true pixel replay: the
// source canvas is fully rasterized first, then sampled).
// B"H 2026-10-09 (readback): exported for getImageData — the 2D context
// rasterizes its own texture through this instead of a PNG round-trip.
export function renderCanvasSurface(texture, allTextures, seen) {
  const w = Math.max(1, Math.round(Number(texture.width || 300)));
  const h = Math.max(1, Math.round(Number(texture.height || 150)));
  const off = new Framebuffer(w, h, [0, 0, 0, 0]);
  replay(off, texture, 1, 1, allTextures, seen);
  return off;
}

function paint2d(fb, texture, box, allTextures, seen) {
  // The page surface is usually a ScaledFramebuffer (supersampled); render
  // the canvas offscreen at device px and composite onto the raw base.
  const scale = (fb.scale && fb.base) ? fb.scale : 1;
  const target = (fb.base && fb.scale) ? fb.base : fb;
  const w = Math.max(1, Math.ceil(box.w * scale)), h = Math.max(1, Math.ceil(box.h * scale));
  const off = new Framebuffer(w, h, [0, 0, 0, 0]);
  const sx = w / Math.max(1, Number(texture.width || 300));
  const sy = h / Math.max(1, Number(texture.height || 150));
  replay(off, texture, sx, sy, allTextures, seen);
  target.blitAlpha(off, Math.round(box.x * scale), Math.round(box.y * scale), 1, 'source-over');
}

// ------------------------------------------------------------------
// Replay
// ------------------------------------------------------------------

function replay(off, texture, sx, sy, allTextures, seen) {
  const rp = { fb: off, sx, sy, allTextures, seen, maskStack: [] };
  for (const cmd of texture.commands || []) execCmd(rp, cmd);
}

function execCmd(rp, cmd) {
  switch (cmd.op) {
    case 'save':
      rp.maskStack.push(rp.fb.getClipMask());
      return;
    case 'restore': {
      const m = rp.maskStack.length ? rp.maskStack.pop() : null;
      rp.fb.setClipMask(m);
      return;
    }
    case 'clip': applyClip(rp, cmd); return;
    case 'clearRect': clearRectCmd(rp, cmd); return;
    case 'fillRect': fillRectCmd(rp, cmd); return;
    case 'strokeRect': strokeRectCmd(rp, cmd); return;
    case 'fillPath': fillPathCmd(rp, cmd); return;
    case 'strokePath': strokePathCmd(rp, cmd); return;
    case 'fillText': case 'strokeText': textCmd(rp, cmd); return;
    case 'drawImageTexture': drawImageCmd(rp, cmd); return;
    case 'putImageData': putImageDataCmd(rp, cmd); return;
    default: return; // beginPath/moveTo/lineTo/... are consumed via cmd.path
  }
}

// ------------------------------------------------------------------
// State helpers
// ------------------------------------------------------------------

function stateOf(cmd) { return cmd.state || {}; }
function transformOf(cmd) {
  const t = stateOf(cmd).transform;
  return Array.isArray(t) && t.length === 6 && t.every(v => Number.isFinite(v)) ? t : IDENT;
}
function alphaOf(cmd) {
  const a = Number(stateOf(cmd).globalAlpha);
  return Number.isFinite(a) ? Math.max(0, Math.min(1, a)) : 1;
}
function compOf(cmd) {
  const op = stateOf(cmd).globalCompositeOperation;
  return COMPOSITE_OPS.has(op) ? op : 'source-over';
}
function lineWidthOf(cmd) {
  const w = Number(stateOf(cmd).lineWidth);
  return Number.isFinite(w) && w > 0 ? w : 1;
}

// Canvas coords -> offscreen px.
function toOff(rp, t, x, y) {
  return [rp.sx * (t[0] * x + t[2] * y + t[4]), rp.sy * (t[1] * x + t[3] * y + t[5])];
}

// Inverse affine map: offscreen px -> canvas coords. null when degenerate.
function inverseMap(rp, t) {
  const A = rp.sx * t[0], B = rp.sx * t[2], E = rp.sx * t[4];
  const C = rp.sy * t[1], D = rp.sy * t[3], F = rp.sy * t[5];
  const det = A * D - B * C;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return null;
  const inv = 1 / det;
  return (X, Y) => {
    const u = X - E, v = Y - F;
    return [(D * u - B * v) * inv, (A * v - C * u) * inv];
  };
}

function isAxisAligned(t) { return t[1] === 0 && t[2] === 0; }

// ------------------------------------------------------------------
// Paint (solid color or canvas gradient), globalAlpha folded in.
// ------------------------------------------------------------------

function fillPaintOf(cmd) {
  const st = stateOf(cmd);
  const p = cmd.fillStyle !== undefined ? cmd.fillStyle : st.fillStyle;
  return paintOf(p, alphaOf(cmd));
}
function strokePaintOf(cmd) {
  const st = stateOf(cmd);
  const p = cmd.strokeStyle !== undefined ? cmd.strokeStyle : st.strokeStyle;
  return paintOf(p, alphaOf(cmd));
}
function paintOf(p, ga) {
  if (p && typeof p === 'object' && Array.isArray(p.stops)) {
    return { kind: 'gradient', grad: p, stops: parseStops(p.stops), ga };
  }
  const c = cssColor(p, [0, 0, 0, 255]);
  return { kind: 'solid', rgba: [c[0], c[1], c[2], Math.round(c[3] * ga)] };
}

function parseStops(stops) {
  const out = (stops || []).map(s => ({
    offset: Math.max(0, Math.min(1, Number(s.offset) || 0)),
    rgba: cssColor(s.color, [0, 0, 0, 255])
  }));
  out.sort((a, b) => a.offset - b.offset);
  return out;
}

function mixRgba(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    Math.round(a[3] + (b[3] - a[3]) * t)
  ];
}

// Gradient color at canvas coords (cx, cy), alpha folded by ga.
function gradientAt(grad, stops, ga, cx, cy) {
  if (!stops.length) return [0, 0, 0, 0];
  if (stops.length === 1) {
    const c = stops[0].rgba;
    return [c[0], c[1], c[2], Math.round(c[3] * ga)];
  }
  let t;
  if (grad.kind === 'radial') {
    const dx = cx - n(grad.x0), dy = cy - n(grad.y0);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r0 = n(grad.r0), r1 = n(grad.r1);
    t = r1 === r0 ? 0 : (dist - r0) / (r1 - r0);
  } else if (grad.kind === 'conic') {
    const ang = Math.atan2(cy - n(grad.y), cx - n(grad.x)) - n(grad.startAngle);
    t = (((ang / (2 * Math.PI)) % 1) + 1) % 1;
  } else { // linear
    const dx = n(grad.x1) - n(grad.x0), dy = n(grad.y1) - n(grad.y0);
    const len2 = dx * dx + dy * dy;
    t = len2 <= 0 ? 0 : ((cx - n(grad.x0)) * dx + (cy - n(grad.y0)) * dy) / len2;
  }
  t = Math.max(0, Math.min(1, t));
  let i = 0;
  while (i < stops.length - 2 && t > stops[i + 1].offset) i++;
  const a = stops[i], b = stops[i + 1];
  const span = (b.offset - a.offset) || 1;
  const local = Math.max(0, Math.min(1, (t - a.offset) / span));
  const c = mixRgba(a.rgba, b.rgba, local);
  return [c[0], c[1], c[2], Math.round(c[3] * ga)];
}

// ------------------------------------------------------------------
// Polygon rasterization (scanline spans)
// ------------------------------------------------------------------

// Rasterize one ring (offscreen coords) into spans: array of [y, x0, x1].
function spansOfRing(pts, W, H, rule) {
  const spans = [];
  if (pts.length < 3) return spans;
  let minY = Infinity, maxY = -Infinity;
  for (const p of pts) { if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]; }
  const y0 = Math.max(0, Math.floor(minY)), y1 = Math.min(H - 1, Math.ceil(maxY));
  for (let y = y0; y <= y1; y++) {
    const yc = y + 0.5;
    const segs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) {
        segs.push({ x: a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1]), dir: b[1] > a[1] ? 1 : -1 });
      }
    }
    segs.sort((p, q) => p.x - q.x);
    if (rule === 'evenodd') {
      for (let i = 0; i + 1 < segs.length; i += 2) spans.push([y, segs[i].x, segs[i + 1].x]);
    } else {
      let wind = 0, startX = 0;
      for (const s of segs) {
        if (wind === 0) startX = s.x;
        wind += s.dir;
        if (wind === 0) spans.push([y, startX, s.x]);
      }
    }
  }
  return spans;
}

// Fill polygon rings (offscreen coords) with a paint.
function fillPolys(rp, cmd, rings, paint, rule = 'nonzero') {
  const fb = rp.fb, op = compOf(cmd);
  const W = fb.width, H = fb.height;
  for (const pts of rings) {
    const spans = spansOfRing(pts, W, H, rule);
    if (paint.kind === 'solid') {
      const [r, g, b, a] = paint.rgba;
      for (const [y, x0, x1] of spans) fb.fillSpanAlpha(y, x0, x1, r, g, b, a, op);
    } else {
      const inv = inverseMap(rp, transformOf(cmd));
      if (!inv) return;
      const mask = fb.getClipMask();
      for (const [y, x0, x1] of spans) {
        const xa = Math.max(0, Math.floor(x0)), xb = Math.min(W, Math.ceil(x1));
        const mrow = y * W;
        for (let x = xa; x < xb; x++) {
          if (mask && mask[mrow + x] === 0) continue;
          const cc = inv(x + 0.5, y + 0.5);
          const rgba = gradientAt(paint.grad, paint.stops, paint.ga, cc[0], cc[1]);
          fb._blendPixelFast(x, y, rgba[0], rgba[1], rgba[2], rgba[3], op);
        }
      }
    }
  }
}

// ------------------------------------------------------------------
// Shadows
// ------------------------------------------------------------------

// Paint the shadow for a shape: rasterize the silhouette into a temp
// surface, blur it, tint with shadowColor, offset, composite under.
function paintShadow(rp, cmd, bbox, silhouette) {
  const st = stateOf(cmd);
  const blur = Number(st.shadowBlur) || 0;
  if (!(blur > 0)) return;
  const sc = cssColor(st.shadowColor, [0, 0, 0, 0]);
  const ga = alphaOf(cmd);
  const sha = Math.round(sc[3] * ga);
  if (sha <= 0) return;
  const r = Math.max(1, Math.round(blur / 2));
  const pad = r * 2 + 2;
  const w = Math.max(1, Math.ceil(bbox.x1 - bbox.x0) + pad * 2);
  const h = Math.max(1, Math.ceil(bbox.y1 - bbox.y0) + pad * 2);
  const tmp = new Framebuffer(w, h, [0, 0, 0, 0]);
  silhouette(tmp, pad - bbox.x0, pad - bbox.y0);
  boxBlurRegion(tmp.data, w, h, r);
  tmp.tintWith([sc[0], sc[1], sc[2], sha]);
  // Shadow offset is in canvas units, not transformed by the CTM (per spec).
  const ox = Number(st.shadowOffsetX) || 0, oy = Number(st.shadowOffsetY) || 0;
  rp.fb.blitAlpha(tmp, Math.round(bbox.x0 - pad + ox * rp.sx), Math.round(bbox.y0 - pad + oy * rp.sy), 1, 'source-over');
}

function bboxOfRings(rings) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const pts of rings) for (const p of pts) {
    if (p[0] < x0) x0 = p[0]; if (p[1] < y0) y0 = p[1];
    if (p[0] > x1) x1 = p[0]; if (p[1] > y1) y1 = p[1];
  }
  return { x0, y0, x1, y1 };
}

// ------------------------------------------------------------------
// Path helpers (canvas coords -> offscreen-coord rings)
// ------------------------------------------------------------------

function pathRings(rp, t, steps) {
  // Split into subpaths (moveTo starts a new ring), sample curves.
  // Open subpaths (polylines) are kept as-is for strokes; fills need >= 3.
  const rings = [];
  let cur = [];
  const pushPt = (x, y) => cur.push(toOff(rp, t, x, y));
  for (const s of steps || []) {
    const op = s[0];
    if (op === 'moveTo') { if (cur.length) rings.push(cur); cur = []; pushPt(n(s[1]), n(s[2])); }
    else if (op === 'lineTo') pushPt(n(s[1]), n(s[2]));
    else if (op === 'rect' || op === 'roundRect') {
      const x = n(s[1]), y = n(s[2]), w = n(s[3]), h = n(s[4]);
      if (cur.length) rings.push(cur); cur = [];
      pushPt(x, y); pushPt(x + w, y); pushPt(x + w, y + h); pushPt(x, y + h); pushPt(x, y);
    }
    else if (op === 'arc' || op === 'ellipse') {
      const ellipse = op === 'ellipse';
      const cx = n(s[1]), cy = n(s[2]), rx = n(s[3]), ry = ellipse ? n(s[4]) : rx;
      const start = ellipse ? n(s[6]) : n(s[4]), end = ellipse ? n(s[7]) : n(s[5]);
      const ac = !!s[ellipse ? 8 : 6];
      const total = end - start, segs = 32;
      for (let i = 0; i <= segs; i++) {
        const a = ac ? start - total * (i / segs) : start + total * (i / segs);
        pushPt(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
      }
    }
    else if (op === 'quadraticCurveTo') {
      const cpx = n(s[1]), cpy = n(s[2]), x = n(s[3]), y = n(s[4]);
      const p0 = cur.length ? unOff(rp, t, cur[cur.length - 1]) : [cpx, cpy];
      for (let i = 1; i <= 16; i++) {
        const u = i / 16, v = 1 - u;
        pushPt(v * v * p0[0] + 2 * u * v * cpx + u * u * x, v * v * p0[1] + 2 * u * v * cpy + u * u * y);
      }
    }
    else if (op === 'bezierCurveTo') {
      const c1x = n(s[1]), c1y = n(s[2]), c2x = n(s[3]), c2y = n(s[4]), x = n(s[5]), y = n(s[6]);
      const p0 = cur.length ? unOff(rp, t, cur[cur.length - 1]) : [c1x, c1y];
      for (let i = 1; i <= 16; i++) {
        const u = i / 16, v = 1 - u;
        pushPt(
          v * v * v * p0[0] + 3 * u * v * v * c1x + 3 * u * u * v * c2x + u * u * u * x,
          v * v * v * p0[1] + 3 * u * v * v * c1y + 3 * u * u * v * c2y + u * u * u * y
        );
      }
    }
    else if (op === 'closePath') { if (cur.length > 2) { cur.push(cur[0].slice()); rings.push(cur); cur = []; } }
  }
  if (cur.length) rings.push(cur);
  return rings;
}

// Approximate inverse for curve sampling: offscreen px -> canvas coords.
function unOff(rp, t, p) {
  const inv = inverseMap(rp, t);
  return inv ? inv(p[0], p[1]) : [0, 0];
}

// ------------------------------------------------------------------
// Command implementations
// ------------------------------------------------------------------

function clearRectCmd(rp, cmd) {
  const t = transformOf(cmd);
  const x = n(cmd.x), y = n(cmd.y), w = n(cmd.width), h = n(cmd.height);
  if (w <= 0 || h <= 0) return;
  const quad = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px, py]) => toOff(rp, t, px, py));
  if (isAxisAligned(t)) {
    const xs = quad.map(p => p[0]), ys = quad.map(p => p[1]);
    rp.fb.clearRectRaw(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    return;
  }
  // Transformed: rasterize quad spans, clear each pixel.
  for (const [yy, x0, x1] of spansOfRing(quad, rp.fb.width, rp.fb.height, 'nonzero')) {
    const y = Math.round(yy);
    for (let x = Math.max(0, Math.floor(x0)); x < Math.min(rp.fb.width, Math.ceil(x1)); x++) {
      rp.fb.writePixel(x, y, 0, 0, 0, 0);
    }
  }
}

function fillRectCmd(rp, cmd) {
  const t = transformOf(cmd);
  const x = n(cmd.x), y = n(cmd.y), w = n(cmd.width), h = n(cmd.height);
  if (w <= 0 || h <= 0) return;
  const paint = fillPaintOf(cmd);
  const quad = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px, py]) => toOff(rp, t, px, py));
  paintShadow(rp, cmd, bboxOfRings([quad]), (tmp, dx, dy) => {
    const moved = quad.map(p => [p[0] + dx, p[1] + dy]);
    for (const [yy, x0, x1] of spansOfRing(moved, tmp.width, tmp.height, 'nonzero')) {
      tmp.fillSpanAlpha(yy, x0, x1, 255, 255, 255, 255, 'source-over');
    }
  });
  fillPolys(rp, cmd, [quad], paint);
}

function strokeRectCmd(rp, cmd) {
  const t = transformOf(cmd);
  const x = n(cmd.x), y = n(cmd.y), w = n(cmd.width), h = n(cmd.height);
  if (w <= 0 || h <= 0) return;
  const paint = strokePaintOf(cmd);
  if (paint.kind !== 'solid') return; // gradient strokes: rare, skip
  const lw = Math.max(1, lineWidthOf(cmd) * (Math.abs(t[0]) * rp.sx + Math.abs(t[3]) * rp.sy) / 2);
  const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]].map(([px, py]) => toOff(rp, t, px, py));
  strokePolyline(rp, cmd, pts, paint.rgba, lw);
}

function fillPathCmd(rp, cmd) {
  const t = transformOf(cmd);
  const rings = pathRings(rp, t, cmd.path || []).filter(r => r.length >= 3);
  if (!rings.length) return;
  const paint = fillPaintOf(cmd);
  const rule = cmd.fillRule === 'evenodd' ? 'evenodd' : 'nonzero';
  paintShadow(rp, cmd, bboxOfRings(rings), (tmp, dx, dy) => {
    const moved = rings.map(r => r.map(p => [p[0] + dx, p[1] + dy]));
    for (const pts of moved) {
      for (const [yy, x0, x1] of spansOfRing(pts, tmp.width, tmp.height, rule)) {
        tmp.fillSpanAlpha(yy, x0, x1, 255, 255, 255, 255, 'source-over');
      }
    }
  });
  fillPolys(rp, cmd, rings, paint, rule);
}

function strokePathCmd(rp, cmd) {
  const t = transformOf(cmd);
  const rings = pathRings(rp, t, cmd.path || []);
  if (!rings.length) return;
  const paint = strokePaintOf(cmd);
  if (paint.kind !== 'solid') return;
  const lw = Math.max(1, lineWidthOf(cmd) * (Math.abs(t[0]) * rp.sx + Math.abs(t[3]) * rp.sy) / 2);
  for (const pts of rings) strokePolyline(rp, cmd, pts, paint.rgba, lw);
}

function strokePolyline(rp, cmd, pts, rgba, width) {
  const fb = rp.fb, op = compOf(cmd);
  const [r, g, b, a] = rgba;
  const rad = Math.max(0.5, width / 2);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(len));
    for (let s = 0; s <= steps; s++) {
      const cx = x0 + (x1 - x0) * (s / steps), cy = y0 + (y1 - y0) * (s / steps);
      const yA = Math.floor(cy - rad), yB = Math.ceil(cy + rad);
      for (let yy = yA; yy <= yB; yy++) {
        const dy = yy + 0.5 - cy;
        const hw = Math.sqrt(Math.max(0, rad * rad - dy * dy));
        fb.fillSpanAlpha(yy, cx - hw, cx + hw, r, g, b, a, op);
      }
    }
  }
}

function textCmd(rp, cmd) {
  const t = transformOf(cmd);
  const [ox, oy] = toOff(rp, t, n(cmd.x), n(cmd.y));
  const isStroke = cmd.op === 'strokeText';
  const paint = isStroke ? strokePaintOf(cmd) : fillPaintOf(cmd);
  const scale = Math.max(1, Math.round(((Math.abs(t[0]) * rp.sx + Math.abs(t[3]) * rp.sy) / 2) || 1));
  const op = compOf(cmd);
  const draw = (fb, dx, dy, rgba) => {
    fb.drawTextAlpha(String(cmd.text || ''), ox + dx, oy + dy, rgba, scale, Infinity, op);
  };
  if (paint.kind === 'solid') {
    paintShadow(rp, cmd, { x0: ox, y0: oy - 10 * scale, x1: ox + String(cmd.text || '').length * 6 * scale, y1: oy + 4 * scale },
      (tmp, dx, dy) => draw(tmp, dx, dy, [255, 255, 255, 255]));
    draw(rp.fb, 0, 0, paint.rgba);
  } else {
    // Gradient text: per-glyph-column gradient eval (approximation).
    const inv = inverseMap(rp, t);
    if (!inv) return;
    const text = String(cmd.text || '');
    let cursor = ox;
    const charW = 6 * scale;
    for (const ch of text) {
      const cc = inv(cursor + charW / 2, oy);
      const rgba = gradientAt(paint.grad, paint.stops, paint.ga, cc[0], cc[1]);
      rp.fb.drawTextAlpha(ch, cursor, oy, rgba, scale, charW + 1, op);
      cursor += charW;
    }
  }
}

function putImageDataCmd(rp, cmd) {
  // B"H 2026-10-09 (readback): real putImageData. Per spec it replaces pixels
  // directly — unaffected by transform, clip, globalAlpha, or compositing.
  // Bulk row memcpy; no per-pixel JS overhead.
  const src = cmd.bytes;
  const sw = Math.round(Number(cmd.width || 0)), sh = Math.round(Number(cmd.height || 0));
  if (!src || !src.length || sw <= 0 || sh <= 0) return;
  const dirtyX = Math.max(0, Math.round(Number(cmd.dirtyX || 0)));
  const dirtyY = Math.max(0, Math.round(Number(cmd.dirtyY || 0)));
  let dw = Math.round(Number(cmd.dirtyWidth || 0)), dh = Math.round(Number(cmd.dirtyHeight || 0));
  dw = Math.min(dw, sw - dirtyX); dh = Math.min(dh, sh - dirtyY);
  if (dw <= 0 || dh <= 0) return;
  const dx = Math.round(Number(cmd.dx || 0)) + dirtyX, dy = Math.round(Number(cmd.dy || 0)) + dirtyY;
  const fb = rp.fb, fw = fb.width, fh = fb.height, dst = fb.data;
  const x0 = Math.max(0, dx), y0 = Math.max(0, dy);
  const x1 = Math.min(fw, dx + dw), y1 = Math.min(fh, dy + dh);
  const cw = x1 - x0;
  if (cw <= 0 || y1 <= y0) return;
  const sox = dirtyX + (x0 - dx), soy = dirtyY + (y0 - dy);
  for (let y = y0; y < y1; y++) {
    const si = ((soy + (y - y0)) * sw + sox) * 4;
    const di = (y * fw + x0) * 4;
    dst.set(src.subarray(si, si + cw * 4), di);
  }
}

function drawImageCmd(rp, cmd) {
  const st = stateOf(cmd);
  const ga = alphaOf(cmd), op = compOf(cmd);
  const t = transformOf(cmd);
  // Resolve the source surface (pixel replay for canvas sources).
  let src = null;
  const srcTex = (rp.allTextures || []).find(x => x.id === cmd.sourceTexture);
  if (srcTex && !(rp.seen && rp.seen.has(srcTex.id))) {
    if (srcTex.kind === 'decoded-image' && srcTex.imageData) {
      const id = srcTex.imageData;
      src = { width: id.width, height: id.height, data: id.data };
    } else if (srcTex.kind === 'canvas-2d' || (srcTex.commands && srcTex.commands.length)) {
      rp.seen.add(srcTex.id);
      try { src = renderCanvasSurface(srcTex, rp.allTextures, rp.seen); }
      finally { rp.seen.delete(srcTex.id); }
    }
  }
  const dx = n(cmd.x), dy = n(cmd.y), dw = n(cmd.width), dh = n(cmd.height);
  if (!src || dw <= 0 || dh <= 0) {
    // Missing-image placeholder (transformed corners).
    const q = [[dx, dy], [dx + dw, dy], [dx + dw, dy + dh], [dx, dy + dh]].map(([px, py]) => toOff(rp, t, px, py));
    const bb = bboxOfRings([q]);
    rp.fb.fillRect(bb.x0, bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0, [45, 60, 95, 255]);
    rp.fb.strokeRect(bb.x0, bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0, [135, 160, 255, 255], 2);
    return;
  }
  let sxx = 0, syy = 0, swd = src.width, shd = src.height;
  if (cmd.sx !== undefined) {
    sxx = Math.max(0, cmd.sx | 0); syy = Math.max(0, cmd.sy | 0);
    swd = Math.min(src.width - sxx, Math.max(1, cmd.sw | 0));
    shd = Math.min(src.height - syy, Math.max(1, cmd.sh | 0));
  }
  const quad = [[dx, dy], [dx + dw, dy], [dx + dw, dy + dh], [dx, dy + dh]].map(([px, py]) => toOff(rp, t, px, py));
  blitTexturedQuad(rp, src, sxx, syy, swd, shd, quad, ga, op);
}

// Blit a source surface region onto the offscreen through a transformed
// destination quad. Axis-aligned quads take a fast scaled path; general
// quads use the affine inverse map for sampling.
function blitTexturedQuad(rp, src, sxx, syy, swd, shd, quad, ga, op) {
  const fb = rp.fb;
  const bb = bboxOfRings([quad]);
  const x0 = Math.max(0, Math.floor(bb.x0)), y0 = Math.max(0, Math.floor(bb.y0));
  const x1 = Math.min(fb.width, Math.ceil(bb.x1)), y1 = Math.min(fb.height, Math.ceil(bb.y1));
  if (x1 <= x0 || y1 <= y0 || swd <= 0 || shd <= 0) return;
  const axis = Math.abs(quad[1][1] - quad[0][1]) < 0.01 && Math.abs(quad[3][0] - quad[0][0]) < 0.01;
  const sdata = src.data, sw = src.width;
  const mask = fb.getClipMask(), dW = fb.width;
  if (axis) {
    const dw = quad[1][0] - quad[0][0], dh = quad[3][1] - quad[0][1];
    if (dw <= 0 || dh <= 0) return;
    for (let Y = y0; Y < y1; Y++) {
      const sy = Math.min(src.height - 1, syy + Math.floor(((Y + 0.5 - quad[0][1]) / dh) * shd));
      const srow = sy * sw, mrow = Y * dW;
      for (let X = x0; X < x1; X++) {
        if (mask && mask[mrow + X] === 0) continue;
        const sx = Math.min(sw - 1, sxx + Math.floor(((X + 0.5 - quad[0][0]) / dw) * swd));
        const si = (srow + sx) * 4;
        const sa = (sdata[si + 3] / 255) * ga;
        if (sa <= 0) continue;
        fb._blendPixelFast(X, Y, sdata[si], sdata[si + 1], sdata[si + 2], Math.round(sa * 255), op);
      }
    }
    return;
  }
  // General quad: affine inverse map from offscreen to (sx, sy) source px.
  const m = quadAffineInverse(quad, sxx, syy, swd, shd);
  if (!m) return;
  for (let Y = y0; Y < y1; Y++) {
    const mrow = Y * dW;
    for (let X = x0; X < x1; X++) {
      if (mask && mask[mrow + X] === 0) continue;
      if (!pointInConvexQuad(X + 0.5, Y + 0.5, quad)) continue;
      const sx = m[0] * (X + 0.5) + m[1] * (Y + 0.5) + m[2];
      const sy = m[3] * (X + 0.5) + m[4] * (Y + 0.5) + m[5];
      const sxi = Math.floor(sx), syi = Math.floor(sy);
      if (sxi < 0 || syi < 0 || sxi >= sw || syi >= src.height) continue;
      const si = (syi * sw + sxi) * 4;
      const sa = (sdata[si + 3] / 255) * ga;
      if (sa <= 0) continue;
      fb._blendPixelFast(X, Y, sdata[si], sdata[si + 1], sdata[si + 2], Math.round(sa * 255), op);
    }
  }
}

// Solve the affine map from offscreen px to source px given the dest quad.
// The dest quad corners correspond to source rect corners
// (sxx,syy),(sxx+swd,syy),(sxx+swd,syy+shd),(sxx,syy+shd).
function quadAffineInverse(quad, sxx, syy, swd, shd) {
  // Map offscreen -> unit square via quad[0], quad[1]-quad[0], quad[3]-quad[0],
  // then unit square -> source px.
  const ax = quad[1][0] - quad[0][0], bx = quad[3][0] - quad[0][0];
  const ay = quad[1][1] - quad[0][1], by = quad[3][1] - quad[0][1];
  const det = ax * by - bx * ay;
  if (Math.abs(det) < 1e-9) return null;
  const inv = 1 / det;
  // (X,Y) -> (u,v): u = ((X-x0)*by - (Y-y0)*bx)*inv, v = (ax*(Y-y0) - ay*(X-x0))*inv
  // (u,v) -> source: sx = sxx + u*swd, sy = syy + v*shd
  const x0 = quad[0][0], y0 = quad[0][1];
  return [
    swd * by * inv, -swd * bx * inv, sxx + swd * (-x0 * by + y0 * bx) * inv,
    -shd * ay * inv, shd * ax * inv, syy + shd * (x0 * ay - y0 * ax) * inv
  ];
}

function pointInConvexQuad(x, y, q) {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i], b = q[(i + 1) % 4];
    const cross = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
    const s = cross > 0 ? 1 : cross < 0 ? -1 : 0;
    if (s !== 0) { if (sign === 0) sign = s; else if (sign !== s) return false; }
  }
  return true;
}

// ------------------------------------------------------------------
// Clip regions
// ------------------------------------------------------------------

function applyClip(rp, cmd) {
  const fb = rp.fb, t = transformOf(cmd);
  const W = fb.width, H = fb.height;
  const old = fb.getClipMask();
  const base = old ? old.slice() : new Uint8Array(W * H).fill(1);
  const rings = pathRings(rp, t, cmd.path || []).filter(r => r.length >= 3);
  const rule = cmd.fillRule === 'evenodd' ? 'evenodd' : 'nonzero';
  if (!rings.length) {
    base.fill(0); // empty clip path -> nothing may paint
  } else {
    const inside = new Uint8Array(W * H); // 1 = inside clip path
    for (const pts of rings) {
      for (const [y, x0, x1] of spansOfRing(pts, W, H, rule)) {
        const xa = Math.max(0, Math.floor(x0)), xb = Math.min(W, Math.ceil(x1));
        for (let x = xa; x < xb; x++) inside[y * W + x] = 1;
      }
    }
    for (let i = 0; i < base.length; i++) base[i] &= inside[i];
  }
  fb.setClipMask(base);
  rp.maskStack.push(old || null);
}

// ------------------------------------------------------------------
// Misc helpers
// ------------------------------------------------------------------

function missing(fb, r) {
  fb.fillRect(r.x, r.y, r.w, r.h, [45, 60, 95, 255]);
  fb.strokeRect(r.x, r.y, r.w, r.h, [135, 160, 255, 255], 2);
  fb.drawText('image', r.x + 6, r.y + 6, [245, 245, 255, 255], 1, Math.max(20, r.w - 12));
}

function inset(box, v) { return { x: box.x + v, y: box.y + v, w: Math.max(1, box.w - v * 2), h: Math.max(1, box.h - v * 2) }; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
function n(value) { return Number(value) || 0; }
