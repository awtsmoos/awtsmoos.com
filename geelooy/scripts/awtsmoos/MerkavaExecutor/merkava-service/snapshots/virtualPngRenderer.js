// B"H
/**
 * @file virtualPngRenderer.js
 * @description
 * Merkava's native software renderer. For heavy stress pages, the Awtsmoos now
 * chooses a 1x proof surface by default: correctness first, no gateway timeout
 * from millions of supersampled rectangle writes. The proof metadata remains,
 * and callers can still reason from pixels, texture counts, and CSS bytes.
 *
 * Full-page mode: when options.fullPage is true, the renderer first lays out
 * the DOM against a tall viewport, measures the true document height
 * (the bottom edge of the lowest laid-out box, excluding the body root which
 * is clamped to at least the probe viewport), and renders the entire scroll
 * height as one PNG instead of just the viewport. The output PNG height
 * always matches the full content height (capped by maxFullHeight).
 *
 * HTML input: when snapshot.dom is absent but snapshot.html is present, the
 * HTML is parsed into a virtual DOM via software/htmlParser.js — the full
 * pipeline (parse → cascade → layout → paint → PNG) runs in one call.
 */
import { dataUrlFromPng } from "./pngTools.js";
import { buildLayoutTree } from "./software/domLayout.js";
import { paintLayout } from "./software/domPainter.js";
import { makeSupersampledSurface } from "./software/supersample.js";
import { background } from "./software/dom-painter/styleTools.js";
import { parseHtmlToDom, extractStyleText } from "./software/htmlParser.js";

const DEFAULT_MAX_FULL_HEIGHT = 16000;
const MAX_DIM = 8192;

function clampDim(v, fallback) {
  const n = Math.floor(Number(v) || fallback);
  return Math.max(1, Math.min(MAX_DIM, n));
}

/**
 * True document height = bottom edge of the lowest laid-out box.
 * buildLayoutTree pushes the body/root item FIRST (index 0), so it is
 * skipped: the root is clamped to at least the probe viewport height and
 * would otherwise report the probe height instead of the content height.
 */
function measureDocumentHeight(layout) {
  let max = 0;
  for (let i = 1; i < layout.length; i++) {
    const item = layout[i];
    if (!item) continue;
    const bottom = (Number(item.y) || 0) + (Number(item.height) || 0);
    if (bottom > max) max = bottom;
  }
  return max;
}

/**
 * Resolve the virtual DOM for a snapshot.
 * Priority: explicit snapshot.dom > parsed snapshot.html > minimal fallback.
 */
function resolveDom(snapshot = {}) {
  if (snapshot.dom) return snapshot.dom;
  const html = String(snapshot.html || "").trim();
  if (html) {
    try {
      return parseHtmlToDom(html);
    } catch {
      // Fall through to the minimal fallback below.
    }
  }
  return {
    tagName: "body",
    localName: "body",
    attributes: {},
    children: snapshot.text
      ? [
          {
            tagName: "p",
            localName: "p",
            attributes: {},
            children: [],
            textContent: String(snapshot.text),
            style: {},
          },
        ]
      : [],
    textContent: "",
    style: {},
  };
}

export function renderVirtualSnapshotPng(snapshot = {}, options = {}) {
  // B"H: clamp viewport — unbounded width/height allocates gigabytes and hangs the encoder.
  const width = clampDim(options.width, 960);
  const viewportHeight = clampDim(options.height, 640);
  const maxFullHeight = Math.max(1, Math.min(16000, Math.floor(Number(options.maxFullHeight) || DEFAULT_MAX_FULL_HEIGHT)));
  const cssText = snapshot.cssText || extractStyleText(snapshot.html || "");
  const dom = resolveDom(snapshot);
  const scale = Number(options.scale || 1);
  // B"H: animation timestamp (ms, default 0). @keyframes animations and
  // `stateChanges` transitions evaluate at this moment — render the same
  // snapshot at successive timestamps for animation frames.
  // stateChanges: [{ selector, at, props }] — declarative :hover/class flips.
  const layoutOptions = {
    cssText,
    time: Math.max(0, Number(options.time) || 0),
    stateChanges: Array.isArray(options.stateChanges) ? options.stateChanges : [],
    // B"H 2026-10-09: media plumbing — lets @media print /
    // (prefers-reduced-motion: reduce) / (forced-colors: active) match.
    mediaType: options.mediaType || options.media,
    reducedMotion: options.reducedMotion,
    forcedColors: options.forcedColors,
  };

  let height = viewportHeight;
  let contentHeight = null;
  let capped = false;
  if (options.fullPage) {
    // Probe pass: lay out against a tall viewport so auto-height content
    // flows to its natural extent, then measure the true document height.
    // nodeFrom() deep-copies the tree, so the probe never mutates the
    // caller's DOM and the final pass below is a clean re-layout.
    const probe = buildLayoutTree(dom, { width, height: maxFullHeight }, { ...layoutOptions });
    contentHeight = Math.ceil(measureDocumentHeight(probe));
    capped = contentHeight > maxFullHeight;
    // A real page is never shorter than the viewport.
    height = Math.max(viewportHeight, Math.min(maxFullHeight, contentHeight));
  }

  const layout = buildLayoutTree(dom, { width, height }, { ...layoutOptions });
  // B"H: fill the canvas with the body's COMPUTED background first —
  // background-color, background shorthand, and linear-gradient are honored,
  // so the surface never starts black under a styled body.
  const bodyBg = bodyBackground(layout);
  const { surface } = makeSupersampledSurface(width, height, scale, bodyBg.color);
  if (bodyBg.gradient) surface.gradientRect(0, 0, width, height, bodyBg.gradient, bodyBg.color);
  paintLayout(surface, layout, snapshot.canvas || {});
  const png = surface.toPngBuffer();
  return {
    backend: "merkava-software-webgl-dom",
    width,
    height,
    fullPage: Boolean(options.fullPage),
    contentHeight,
    capped,
    mimeType: "image/png",
    bytes: png.length,
    dataUrl: dataUrlFromPng(png),
    note: "Rendered from Merkava DOM layout + source CSS + software framebuffer + 2D/WebGL command painters.",
    proof: analyzePixels(surface, snapshot, cssText, bodyBg.color)
  };
}

// B"H: read the body's computed background through the painter's own
// background() helper — background-color, background shorthand, and
// linear-gradient resolve exactly as paintBox will paint them.
function bodyBackground(layout = []) {
  const body = layout.find(item => item && item.kind === "body") || layout[0] || {};
  return background(body.style || {}, { kind: "body" });
}

function analyzePixels(fb, snapshot, cssText, bgColor = [8, 9, 14, 255]) {
  return {
    nonBackgroundPixels: fb.countNonBackground(bgColor),
    canvasTextures: snapshot.canvas?.textures?.length || 0,
    canvasCommands: snapshot.canvas?.commands?.length || 0,
    cssBytes: String(cssText || "").length,
    sampleTopLeft: fb.sample(10, 10),
    sampleCenter: fb.sample(Math.floor(fb.width / 2), Math.floor(fb.height / 2)),
    antialiasing: "1x-stress-proof-mode"
  };
}
