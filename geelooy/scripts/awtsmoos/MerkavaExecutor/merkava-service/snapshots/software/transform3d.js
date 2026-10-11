// B"H
/**
 * transform3d — surgical 3D transform support for the software painter.
 *
 * Model: 4x4 row-major matrices. Composition follows CSS order —
 *   transform: f1 f2 ... fn  =>  M = M1 * M2 * ... * Mn
 * (the rightmost function applies first to the point). This is the CSS/SVG
 * convention; the legacy 2D composer in CssTransform.js is left untouched.
 *
 * A transformed element is rasterized flat into a temp buffer, then each
 * destination pixel inside the projected quad is inverse-mapped exactly:
 *   screen = s * (R * (ux,uy,0) + t),  s = d / (d - z')
 * which reduces to a 2x2 linear solve per pixel (q = 1/s is linear in ux,uy).
 * No DLT/homography estimation is needed and the result is exact.
 *
 * Scene: the element's own 4x4 is accumulated through ancestors that carry
 * their own transform AND transform-style:preserve-3d. The perspective
 * distance comes from the nearest ancestor `perspective` property (or a
 * perspective() function inside the element's own transform list). Ancestors
 * with a transform but no preserve-3d flatten in CSS; that flattening is out
 * of scope — accumulation stops there (documented in SUMMARY.md).
 */
import transformPkg from "../../../merkava-browser/standards/css/CssTransform.js";

const { parseTransform, parseTransformOrigin, angleToRad, lengthToPx } = transformPkg;

const FN3D = new Set(["rotatex", "rotatey", "translatez", "scalez", "perspective", "matrix3d"]);

/** True when the transform list contains a genuine 3D function (non-degenerate). */
export function styleHas3DTransform(style = {}) {
  const list = parseTransform(style.transform);
  for (const fn of list) {
    if (FN3D.has(fn.name)) return true;
    if ((fn.name === "translate3d" || fn.name === "scale3d") && fn.args[2] !== undefined) {
      if (Math.abs(lengthToPx(fn.args[2])) > 1e-9) return true;
    }
  }
  return false;
}

/* ---------------- 4x4 row-major matrix kit ---------------- */

function identity4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/** Returns a*b (b applies first). */
function mul4(a, b) {
  const o = new Array(16);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      o[r * 4 + c] =
        a[r * 4] * b[c] + a[r * 4 + 1] * b[4 + c] +
        a[r * 4 + 2] * b[8 + c] + a[r * 4 + 3] * b[12 + c];
    }
  }
  return o;
}

function mTranslate(tx, ty, tz) {
  return [1, 0, 0, tx, 0, 1, 0, ty, 0, 0, 1, tz, 0, 0, 0, 1];
}
function mRotateX(a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1];
}
function mRotateY(a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1];
}
function mRotateZ(a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function mScale(sx, sy, sz) {
  return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
}
function mSkew(ax, ay) {
  const tx = Math.tan(ax), ty = Math.tan(ay);
  return [1, tx, 0, 0, ty, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function mPerspective(d) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1 / d, 1];
}

function num(t, fb) {
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : fb;
}

function functionToMatrix4(fn, refBox = {}) {
  const w = Number(refBox.width) || 0;
  const h = Number(refBox.height) || 0;
  const fs = Number(refBox.fontSize) || 16;
  const len = (t, base) => lengthToPx(t, base, fs);
  const a = fn.args;
  switch (fn.name) {
    case "translate": return mTranslate(len(a[0], w), len(a[1], h), 0);
    case "translatex": return mTranslate(len(a[0], w), 0, 0);
    case "translatey": return mTranslate(0, len(a[0], h), 0);
    case "translatez": return mTranslate(0, 0, len(a[0], 0));
    case "translate3d": return mTranslate(len(a[0], w), len(a[1], h), len(a[2], 0));
    case "rotate":
    case "rotatez": return mRotateZ(angleToRad(a[0]));
    case "rotatex": return mRotateX(angleToRad(a[0]));
    case "rotatey": return mRotateY(angleToRad(a[0]));
    case "scale": {
      const sx = num(a[0], 1);
      const sy = a[1] !== undefined ? num(a[1], 1) : sx;
      return mScale(sx, sy, 1);
    }
    case "scalex": return mScale(num(a[0], 1), 1, 1);
    case "scaley": return mScale(1, num(a[0], 1), 1);
    case "scalez": return mScale(1, 1, num(a[0], 1));
    case "scale3d": return mScale(num(a[0], 1), num(a[1], 1), num(a[2], 1));
    case "skew": return mSkew(angleToRad(a[0]), angleToRad(a[1] || "0"));
    case "skewx": return mSkew(angleToRad(a[0]), 0);
    case "skewy": return mSkew(0, angleToRad(a[0]));
    case "perspective": {
      const d = lengthToPx(a[0]);
      return d > 0 ? mPerspective(d) : identity4();
    }
    case "matrix": {
      const v = a.map(x => parseFloat(x));
      if (v.length < 6 || v.some(x => !Number.isFinite(x))) return identity4();
      return [v[0], v[2], 0, v[4], v[1], v[3], 0, v[5], 0, 0, 1, 0, 0, 0, 0, 1];
    }
    case "matrix3d": {
      const v = a.map(x => parseFloat(x));
      if (v.length < 16 || v.some(x => !Number.isFinite(x))) return identity4();
      // CSS lists column-major; convert to row-major (transpose).
      const o = new Array(16);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) o[r * 4 + c] = v[c * 4 + r];
      return o;
    }
    default: return identity4();
  }
}

function origin3D(value, refBox = {}) {
  const o = parseTransformOrigin(value, refBox);
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  const fs = Number(refBox.fontSize) || 16;
  const z = parts.length >= 3 ? lengthToPx(parts[2], 0, fs) : 0;
  return { x: o.x, y: o.y, z: Number.isFinite(z) ? z : 0 };
}

/**
 * Compose the element's own transform list into a 4x4 in CSS order,
 * wrapped in transform-origin.
 */
export function composeTransform4(style = {}, refBox = {}) {
  const list = parseTransform(style.transform);
  let M = identity4();
  for (const fn of list) M = mul4(M, functionToMatrix4(fn, refBox));
  const o = origin3D(style["transform-origin"], refBox);
  if (o.x || o.y || o.z) M = mul4(mTranslate(o.x, o.y, o.z), mul4(M, mTranslate(-o.x, -o.y, -o.z)));
  return M;
}

function parsePerspectiveProp(value) {
  const t = String(value || "").trim().toLowerCase();
  if (!t || t === "none") return 0;
  const n = lengthToPx(t);
  return n > 0 ? n : 0;
}

function mergedStyle(node) {
  return { ...(node.style || {}), ...(node.computedStyle || {}) };
}

/**
 * Build the 3D scene for a transformed layout item.
 * Returns { M, d, px, py, backfaceHidden } or null when no 3D transform applies.
 * byNode maps DOM nodes to layout items (for ancestor transform-origin boxes).
 *
 * M maps tsrc-local coords into the OUTERMOST accumulated frame's local
 * coords; (px,py) is that frame's page position. With no accumulated
 * ancestors, the frame is the element itself (px,py = tsrc.x,tsrc.y).
 *
 * Two cases:
 * A. The element itself has a 3D transform: its matrix is accumulated through
 *    ancestors that carry their own transform AND transform-style:preserve-3d.
 *    Accumulation stops at a transformed ancestor without preserve-3d
 *    (CSS would flatten the element into that ancestor's plane — out of scope).
 * B. The element has no 3D transform of its own: 3D-transformed ancestors
 *    still tilt it (it has no z, so flattening is a no-op for it) — this is
 *    the browser behavior for children of rotateX/rotateY parents.
 */
export function computeScene3D(tsrc, byNode = null) {
  const selfStyle = (tsrc && tsrc.style) || {};
  const selfHas3D = styleHas3DTransform(selfStyle);
  const refBox = {
    width: Math.max(0, Number(tsrc.width) || 0),
    height: Math.max(0, Number(tsrc.height) || 0),
    fontSize: 16,
  };
  let M = selfHas3D ? composeTransform4(selfStyle, refBox) : identity4();
  let acc3D = selfHas3D;
  // Outermost frame page position (starts as the element itself).
  let px = Number(tsrc.x) || 0;
  let py = Number(tsrc.y) || 0;
  // Current reference box page position (for ancestor offsets).
  let curX = px, curY = py;
  let d = 0;
  let node = tsrc.node ? tsrc.node.parentNode : null;
  let guard = 0;
  while (node && node.nodeType === 1 && guard++ < 64) {
    const st = mergedStyle(node);
    if (d <= 0) {
      const pd = parsePerspectiveProp(st.perspective);
      if (pd > 0) d = pd;
    }
    const t = String(st.transform || "").trim();
    if (t && t.toLowerCase() !== "none") {
      const preserve = String(st["transform-style"] || "").toLowerCase() === "preserve-3d";
      const ancHas3D = styleHas3DTransform(st);
      if (ancHas3D && (preserve || !selfHas3D)) {
        const li = byNode ? byNode.get(node) : null;
        if (!li) { node = node.parentNode; continue; }
        const ax = Number(li.x) || 0, ay = Number(li.y) || 0;
        const MA = composeTransform4(st, {
          width: Math.max(0, Number(li.width) || 0),
          height: Math.max(0, Number(li.height) || 0),
          fontSize: 16,
        });
        // M_new = MA * T(cur - A) * M_old  (cur frame offset inside A)
        const ox = curX - ax, oy = curY - ay;
        M = mul4(MA, mul4(mTranslate(ox, oy, 0), M));
        px = ax; py = ay;
        curX = ax; curY = ay;
        acc3D = true;
      } else if (!preserve) {
        break;
      }
    }
    node = node.parentNode;
  }
  if (!acc3D) return null;
  // Back face: sign of the transformed plane normal's z.
  const nz = M[10];
  const backfaceHidden =
    String(selfStyle["backface-visibility"] || "").toLowerCase() === "hidden" && nz < 0;
  return { M, d, px, py, backfaceHidden };
}

/* ---------------- projection + projective blit ---------------- */

/**
 * Effective homogeneous row (m30, m31, m33) of the total transform.
 * The scene perspective distance d acts as P(d) * M; a perspective() function
 * inside the transform list already lives in M's own row 3.
 * Screen: X = x1/w1, Y = y1/w1 with w1 = m30*ux + m31*uy + m33.
 */
function effectiveRow3(M, d) {
  let m30 = M[12], m31 = M[13], m33 = M[15];
  if (d > 0) {
    m30 += -M[8] / d;
    m31 += -M[9] / d;
    m33 += -M[11] / d;
  }
  return [m30, m31, m33];
}

/** Project a tsrc-local rect through the scene into page space. */
export function projectSceneCorners(scene, rect) {
  const { M, d, px, py } = scene;
  const [m30, m31, m33] = effectiveRow3(M, d);
  const corners = [
    [rect.x, rect.y],
    [rect.x + rect.w, rect.y],
    [rect.x, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h],
  ];
  const out = [];
  for (const [x, y] of corners) {
    const x1 = M[0] * x + M[1] * y + M[3];
    const y1 = M[4] * x + M[5] * y + M[7];
    const w1 = m30 * x + m31 * y + m33;
    if (!(w1 > 0.05)) { out.push({ x: 0, y: 0, ok: false }); continue; }
    out.push({ x: (px || 0) + x1 / w1, y: (py || 0) + y1 / w1, ok: true });
  }
  return out;
}

/**
 * Inverse-map composite for 3D scenes. destFb gets the temp buffer warped by
 * the exact projective inverse: with w1 = m30*ux + m31*uy + m33,
 *   X*w1 = r00*ux + r01*uy + t0
 * is linear in (ux,uy) — a 2x2 solve per pixel. (X,Y) are outer-frame-local
 * coords (dest page pixel minus the scene's px,py). ox/oy map tsrc-local
 * untransformed coords into temp space (temp = (ux + ox, uy + oy)).
 */
export function blitProjective(destFb, srcBase, scene, tw, th, ox, oy, scale) {
  const { M, d, px, py } = scene;
  const r00 = M[0], r01 = M[1], t0 = M[3];
  const r10 = M[4], r11 = M[5], t1 = M[7];
  const [m30, m31, m33] = effectiveRow3(M, d);
  // B"H 2026-10-09 — loop over the temp rect (forward-projected), not just
  // the item: filter spread lives in the temp's padding.
  const cwCss = srcBase.width / scale, chCss = srcBase.height / scale;
  const corners = projectSceneCorners(scene, { x: -ox, y: -oy, w: cwCss, h: chCss });
  const good = corners.filter(c => c.ok);
  if (!good.length) return;
  const xs = good.map(c => c.x), ys = good.map(c => c.y);
  const x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs));
  const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
  const destBase = destFb && destFb.base ? destFb.base : destFb;
  const ds = (destFb && destFb.scale) || 1;
  if (!destBase || !destBase.data) return;
  const sw = srcBase.width, sh = srcBase.height;
  const sdata = srcBase.data, ddata = destBase.data;
  const dw = destBase.width, dh = destBase.height;
  for (let cy = y0; cy < y1; cy++) {
    for (let cx = x0; cx < x1; cx++) {
      const X = cx - (px || 0);
      const Y = cy - (py || 0);
      // (r00 - X*m30)*ux + (r01 - X*m31)*uy = X*m33 - t0
      const A = r00 - X * m30;
      const B = r01 - X * m31;
      const C = r10 - Y * m30;
      const D = r11 - Y * m31;
      const E = X * m33 - t0;
      const F = Y * m33 - t1;
      const det = A * D - B * C;
      if (!det || !Number.isFinite(det) || Math.abs(det) < 1e-12) continue;
      const ux = (E * D - B * F) / det;
      const uy = (A * F - E * C) / det;
      if (!Number.isFinite(ux) || !Number.isFinite(uy)) continue;
      const w1 = m30 * ux + m31 * uy + m33;
      if (!(w1 > 0.05)) continue; // at / behind the eye: clipped
      const sx = Math.round((ux + ox) * scale);
      const sy = Math.round((uy + oy) * scale);
      if (sx < 0 || sy < 0 || sx >= sw || sy >= sh) continue;
      const si = (sy * sw + sx) * 4;
      const a = sdata[si + 3];
      if (a <= 4) continue;
      const dx0 = Math.round(cx * ds);
      const dy0 = Math.round(cy * ds);
      const alpha = a / 255;
      const ia = 1 - alpha;
      for (let yy = 0; yy < ds; yy++) {
        const dy = dy0 + yy;
        if (dy < 0 || dy >= dh) continue;
        for (let xx = 0; xx < ds; xx++) {
          const dx = dx0 + xx;
          if (dx < 0 || dx >= dw) continue;
          const di = (dy * dw + dx) * 4;
          ddata[di] = Math.round(sdata[si] * alpha + ddata[di] * ia);
          ddata[di + 1] = Math.round(sdata[si + 1] * alpha + ddata[di + 1] * ia);
          ddata[di + 2] = Math.round(sdata[si + 2] * alpha + ddata[di + 2] * ia);
          ddata[di + 3] = 255;
        }
      }
    }
  }
}
