// B"H
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { parseHtmlNodes } = require("../../../scripts/awtsmoos/MerkavaExecutor/merkava-binary/SourceAppCompiler.js");
const { encodeMode2JsBinary, runMode2JsBinary } = require("../../../scripts/awtsmoos/MerkavaExecutor/merkava-binary/Mode2JsBinary.js");
const { SyntheticBrowserRuntime } = require("../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/SyntheticBrowserRuntime.js");

/**
 * Chapter 3: The Page Soul Learns to Speak OpenGL.
 *
 * This file is deliberately not a C browser. It asks MerkavaExecutor's virtual
 * browser to parse, host, execute, interact, and render. The output is a tiny
 * native command stream: C receives rectangles, text, and WebGL facts after the
 * executor has already decided what the page means.
 *
 * @param {{html: string, scripts: string[], url?: string}} page
 * @returns {Promise<{stream: string, summary: object, snapshot: object}>}
 */
export async function buildMerkavaExecutorRenderStream(page) {
  const runtime = new SyntheticBrowserRuntime({ url: page.url || "file:///index.html" });
  hydrateVirtualDom(runtime.window.document, parseHtmlNodes(page.html || ""));
  for (const source of page.scripts || []) {
    const binary = await encodeMode2JsBinary(String(source || ""));
    runMode2JsBinary(binary, { globals: runtime.globals() });
  }
  clickIfPresent(runtime.window, "#draw");
  const snapshot = runtime.window.renderWebGLDom();
  const stream = encodeNativeStream(snapshot.commands);
  return {
    stream,
    snapshot,
    summary: {
      commandCount: snapshot.commands.length,
      textureCount: snapshot.textures.length,
      streamBytes: Buffer.byteLength(stream, "utf8")
    }
  };
}

function hydrateVirtualDom(document, nodes) {
  const byId = { "": document.body };
  for (const node of nodes) {
    const element = document.createElement(node.tag);
    for (const [key, value] of Object.entries(node.attrs || {})) element.setAttribute(key, value);
    if (node.text) element.textContent = node.text;
    applyNativeDefaults(element, node);
    const parent = byId[node.parent || ""] || document.body;
    parent.appendChild(element);
    if (node.id) byId[node.id] = element;
  }
}

function applyNativeDefaults(element, node) {
  const attrs = node.attrs || {};
  if (node.tag === "canvas") {
    element.width = Number(attrs.width || 300);
    element.height = Number(attrs.height || 150);
    element.setAttribute("style", `width: ${element.width}px; height: ${element.height}px; background-color: #102038`);
  } else if (node.tag === "button") {
    element.setAttribute("style", "width: 80px; height: 28px; background-color: #e8e8e8; color: #111111");
  } else if (node.tag === "output") {
    element.setAttribute("style", "width: 240px; height: 28px; background-color: #f8f8f8; color: #111111");
  } else {
    element.setAttribute("style", "width: 360px; height: 40px; background-color: #ffffff; color: #111111");
  }
}

function clickIfPresent(window, selector) {
  const target = window.document.querySelector(selector);
  if (target) target.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
}

function encodeNativeStream(commands) {
  return commands.map((command, index) => encodeCommand(command, index)).filter(Boolean).join("\n");
}

function encodeCommand(command, index) {
  if (command.op === "paintBox") return ["BOX", index, n(command.x), n(command.y), n(command.width), n(command.height), color(command.background)].join("|");
  if (command.op === "paintTextPlaceholder") return ["TEXT", index, n(command.x), n(command.y), safe(command.text), color(command.color)].join("|");
  if (command.op?.startsWith?.("webgl.")) return ["WEBGL", index, safe(command.op), JSON.stringify(command).length].join("|");
  return null;
}

function n(value) { return Number(value || 0).toFixed(2); }
function safe(value) { return String(value || "").replace(/[|\r\n]/g, " ").slice(0, 120); }
function color(value) { return safe(value || "#ffffff"); }
