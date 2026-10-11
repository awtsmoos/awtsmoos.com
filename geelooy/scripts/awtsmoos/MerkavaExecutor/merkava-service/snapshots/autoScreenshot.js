// B"H
/**
 * @file autoScreenshot.js
 * @description
 * Automatic screenshot pipeline for Merkava renders.
 *
 * Every render through this module:
 *   1. Renders via the real renderVirtualSnapshotPng (no mocks).
 *   2. Saves the PNG to ~/workspace/merkava-screenshots/<timestamp>-<label>.png
 *      plus a rolling latest.png.
 *   3. Appends a JSONL entry to history.jsonl (timestamp, label, dims, bytes, URI).
 *   4. Prints the sandbox:// URI to stdout so it is visible in exec output.
 *   5. Returns the render result enriched with screenshotPath + screenshotUri,
 *      so the calling agent can immediately `muse.read` the PNG (which injects
 *      the image into the agent's context) or attach it via sandbox:// markdown.
 *
 * This is how "the AI always sees screenshots": the agent that triggered the
 * render reads screenshotPath right after the call — one line, no manual hunting.
 *
 * Gallery: history.jsonl is the machine-readable gallery; listScreenshots()
 * returns the newest entries first.
 *
 * "Screenshot this page": screenshotHtml(html, options, label) renders raw HTML
 * in one call. For a live URL, fetch the HTML first (browser.open on the parent
 * side) and pass it here — Merkava renders the fetched markup.
 */
import { writeFileSync, appendFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { renderVirtualSnapshotPng } from "./virtualPngRenderer.js";

export function screenshotDir() {
  return process.env.MERKAVA_SCREENSHOT_DIR || join(homedir(), "workspace", "merkava-screenshots");
}
// B"H: resolved lazily (not at import time) so tests and long-lived processes
// can point captures elsewhere via MERKAVA_SCREENSHOT_DIR at call time.
export const SCREENSHOT_DIR = screenshotDir();

const HISTORY_FILE = "history.jsonl";
const LATEST_FILE = "latest.png";

function ensureDir() {
  mkdirSync(screenshotDir(), { recursive: true });
}

function sanitizeLabel(label) {
  return String(label || "render")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "render";
}

function stampName(label) {
  const d = new Date();
  const p = (n, w = 2) => String(n).padStart(w, "0");
  const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return `${stamp}-${sanitizeLabel(label)}.png`;
}

function toSandboxUri(absPath) {
  const home = homedir() + "/";
  const rel = absPath.startsWith(home) ? absPath.slice(home.length) : absPath;
  return `sandbox://${rel}`;
}

function pngBufferFrom(result) {
  const dataUrl = String(result.dataUrl || "");
  const comma = dataUrl.indexOf(",");
  if (comma < 0) throw new Error("autoScreenshot: render result has no dataUrl");
  return Buffer.from(dataUrl.slice(comma + 1), "base64");
}

/**
 * Render and auto-capture. Drop-in enrichment of renderVirtualSnapshotPng.
 * @param {object} snapshot - { html } or { dom } or { cssText, dom } ...
 * @param {object} options - { width, height, fullPage, time, ... }
 * @param {string} label - short human label for the filename/history
 * @returns {object} render result + { screenshotPath, screenshotUri, historyEntry }
 */
export function renderAndCapture(snapshot = {}, options = {}, label = "render") {
  const result = renderVirtualSnapshotPng(snapshot, options);
  ensureDir();
  const buf = pngBufferFrom(result);
  const fileName = stampName(label);
  const absPath = join(screenshotDir(), fileName);
  writeFileSync(absPath, buf);
  // Rolling "latest" copy for the fixed-path convention.
  writeFileSync(join(screenshotDir(), LATEST_FILE), buf);

  const entry = {
    ts: Date.now(),
    iso: new Date().toISOString(),
    label: sanitizeLabel(label),
    file: fileName,
    path: absPath,
    uri: toSandboxUri(absPath),
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    backend: result.backend,
    fullPage: Boolean(result.fullPage),
  };
  appendFileSync(join(screenshotDir(), HISTORY_FILE), JSON.stringify(entry) + "\n");
  console.log(`[merkava-screenshot] ${entry.uri} (${result.width}x${result.height}, ${result.bytes} bytes)`);
  return { ...result, screenshotPath: absPath, screenshotUri: entry.uri, historyEntry: entry };
}

/**
 * "Screenshot this page" — one call from raw HTML to captured PNG.
 */
export function screenshotHtml(html, options = {}, label = "page") {
  return renderAndCapture({ html: String(html || "") }, options, label);
}

/**
 * Newest-first gallery entries. Limit 0 = all.
 */
export function listScreenshots(limit = 20) {
  const histPath = join(screenshotDir(), HISTORY_FILE);
  if (!existsSync(histPath)) return [];
  const lines = readFileSync(histPath, "utf8").split("\n").filter(Boolean);
  const entries = [];
  for (const line of lines) {
    try { entries.push(JSON.parse(line)); } catch { /* skip corrupt line */ }
  }
  entries.reverse();
  return limit > 0 ? entries.slice(0, limit) : entries;
}

/**
 * Absolute path of the most recent capture (rolling latest.png).
 * Returns null when nothing has been captured yet.
 */
export function latestScreenshot() {
  const p = join(screenshotDir(), LATEST_FILE);
  return existsSync(p) ? p : null;
}
