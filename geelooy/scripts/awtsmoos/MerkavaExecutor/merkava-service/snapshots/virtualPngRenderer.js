// B"H
/**
 * @file virtualPngRenderer.js
 * @description
 * Merkava's native software renderer. For heavy stress pages, the Awtsmoos now
 * chooses a 1x proof surface by default: correctness first, no gateway timeout
 * from millions of supersampled rectangle writes. The proof metadata remains,
 * and callers can still reason from pixels, texture counts, and CSS bytes.
 */
import { dataUrlFromPng } from "./pngTools.js";
import { buildLayoutTree } from "./software/domLayout.js";
import { paintLayout } from "./software/domPainter.js";
import { makeSupersampledSurface } from "./software/supersample.js";

export function renderVirtualSnapshotPng(snapshot = {}, options = {}) {
  const width = Number(options.width || 960);
  const height = Number(options.height || 640);
  const cssText = snapshot.cssText || extractCssText(snapshot.html || "");
  const { surface } = makeSupersampledSurface(width, height, Number(options.scale || 1), [8, 9, 14, 255]);
  const layout = buildLayoutTree(snapshot.dom || htmlFallbackDom(snapshot), { width, height }, { cssText });
  paintLayout(surface, layout, snapshot.canvas || {});
  const png = surface.toPngBuffer();
  return {
    backend: "merkava-software-webgl-dom",
    width,
    height,
    mimeType: "image/png",
    bytes: png.length,
    dataUrl: dataUrlFromPng(png),
    note: "Rendered from Merkava DOM layout + source CSS + software framebuffer + 2D/WebGL command painters.",
    proof: analyzePixels(surface, snapshot, cssText)
  };
}

function analyzePixels(fb, snapshot, cssText) {
  return {
    nonBackgroundPixels: fb.countNonBackground([8, 9, 14, 255]),
    canvasTextures: snapshot.canvas?.textures?.length || 0,
    canvasCommands: snapshot.canvas?.commands?.length || 0,
    cssBytes: String(cssText || "").length,
    sampleTopLeft: fb.sample(10, 10),
    sampleCenter: fb.sample(Math.floor(fb.width / 2), Math.floor(fb.height / 2)),
    antialiasing: "1x-stress-proof-mode"
  };
}

function extractCssText(html) {
  return [...String(html || "").matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]).join("\n");
}

function htmlFallbackDom(snapshot = {}) {
  return {
    tagName: "body",
    localName: "body",
    style: { "background-color": "#08090e", color: "#f6f6fa", padding: "24px" },
    textContent: snapshot.text || "",
    children: [
      { tagName: "main", localName: "main", style: { "background-color": "#1e2028", padding: "18px", margin: "16px" }, children: [{ tagName: "p", localName: "p", textContent: snapshot.text || "Merkava snapshot", style: { color: "white", "font-size": "18px" }, children: [] }] }
    ]
  };
}
