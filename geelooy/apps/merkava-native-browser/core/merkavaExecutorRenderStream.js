// B"H
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { encodeMode2JsBinary, runMode2JsBinary } = require("../../../scripts/awtsmoos/MerkavaExecutor/merkava-binary/Mode2JsBinary.js");
const { SyntheticBrowserRuntime } = require("../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/SyntheticBrowserRuntime.js");
const { VirtualHtmlHydrator } = require("../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualHtmlHydrator.js");

/**
 * Chapter 3: The Page Soul Learns to Speak OpenGL.
 *
 * MerkavaExecutor parses and hydrates HTML into its own virtual DOM, executes
 * page JS against that DOM, lays it out into virtual WebGL/DOM paint commands,
 * and only then emits a compact command stream for the C host. The host remains
 * a servant of bytecode/runtime decisions, not a browser engine.
 *
 * @param {{html: string, scripts: string[], url?: string}} page
 * @returns {Promise<{stream: string, summary: object, snapshot: object}>}
 */
export async function buildMerkavaExecutorRenderStream(page) {
  const runtime = new SyntheticBrowserRuntime({ url: page.url || "file:///index.html" });
  const hydration = new VirtualHtmlHydrator().hydrate(runtime.window.document, page.html || "");
  applyRuntimeDefaults(runtime.window.document);
  const scriptErrors = [];
  for (const source of page.scripts || []) {
    try {
      const binary = await encodeMode2JsBinary(String(source || ""));
      runMode2JsBinary(binary, { globals: runtime.globals() });
    } catch (error) {
      scriptErrors.push({ message: error.message, bytes: Buffer.byteLength(String(source || ""), "utf8") });
    }
  }
  clickIfPresent(runtime.window, "#draw");
  const snapshot = runtime.window.renderWebGLDom();
  const stream = encodeNativeStream(snapshot.commands);
  return {
    stream,
    snapshot,
    summary: {
      hydration,
      scriptErrors,
      commandCount: snapshot.commands.length,
      textureCount: snapshot.textures.length,
      streamBytes: Buffer.byteLength(stream, "utf8")
    }
  };
}

function applyRuntimeDefaults(document) {
  const walk = node => {
    if (node.nodeType === 3) return;
    const tag = node.localName;
    if (tag === "canvas") {
      const width = Number(node.getAttribute("width") || node.width || 300);
      const height = Number(node.getAttribute("height") || node.height || 150);
      node.width = width; node.height = height;
      ensureStyle(node, { width: `${width}px`, height: `${height}px`, "background-color": "#102038", color: "#ffffff" });
    } else if (tag === "button") ensureStyle(node, { width: "96px", height: "32px", "background-color": "#e8e8e8", color: "#111111", padding: "6px" });
    else if (tag === "input") ensureStyle(node, { width: "220px", height: "30px", "background-color": "#ffffff", color: "#111111", padding: "5px", "border-width": "1px" });
    else if (tag === "textarea") ensureStyle(node, { width: "260px", height: "70px", "background-color": "#ffffff", color: "#111111", padding: "5px", "border-width": "1px" });
    else if (tag === "select") ensureStyle(node, { width: "220px", height: "30px", "background-color": "#ffffff", color: "#111111", padding: "5px", "border-width": "1px" });
    else if (tag === "output") ensureStyle(node, { width: "260px", height: "32px", "background-color": "#f8f8f8", color: "#111111", padding: "6px" });
    else if (tag === "body") ensureStyle(node, { width: "760px", "background-color": "#ffffff", color: "#111111" });
    for (const child of node.children || []) walk(child);
  };
  walk(document.documentElement);
}

function ensureStyle(node, props) {
  const computed = node.ownerDocument?.cssEngine?.compute(node) || {};
  for (const [key, value] of Object.entries(props)) {
    if (!node.style.getPropertyValue(key) && !computed[key]) node.style.setProperty(key, value);
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
  if (command.op === "paintBorder") return ["BORDER", index, n(command.x), n(command.y), n(command.width), n(command.height), color(command.color)].join("|");
  if (command.op === "paintShadow") return ["BOX", index, n(command.x), n(command.y), n(command.width), n(command.height), "#d8d8d8"].join("|");
  if (command.op === "paintImageTexture") return ["IMAGE", index, n(command.x), n(command.y), n(command.width), n(command.height), safe(command.src)].join("|");
  if (command.op === "paintBackgroundImage") return ["BGIMAGE", index, n(command.x), n(command.y), n(command.width), n(command.height), safe(command.src)].join("|");
  if (command.op === "paintGradient") return ["GRADIENT", index, n(command.x), n(command.y), n(command.width), n(command.height), safe(command.gradient)].join("|");
  if (command.op === "paintClipPush") return ["CLIP_PUSH", index, n(command.x), n(command.y), n(command.width), n(command.height), n(command.radius)].join("|");
  if (command.op === "paintClipPop") return ["CLIP_POP", index, n(command.x), n(command.y), n(command.width), n(command.height), ""].join("|");
  if (command.op === "paintBorderRadius") return ["RADIUS", index, n(command.x), n(command.y), n(command.width), n(command.height), n(command.radius)].join("|");
  if (command.op === "paintOpacity") return ["OPACITY", index, n(command.x), n(command.y), n(command.width), n(command.height), n(command.alpha)].join("|");
  if (command.op === "paintTransform") return ["TRANSFORM", index, n(command.x), n(command.y), n(command.width), n(command.height), safe(command.transform)].join("|");
  if (command.op === "paintImagePlaceholder") return ["BOX", index, n(command.x), n(command.y), n(command.width), n(command.height), color(command.background || "#e0e6ef")].join("|");
  if (command.op === "paintTextPlaceholder") return ["TEXT", index, n(command.x), n(command.y), safe(command.text), color(command.color)].join("|");
  if (command.op?.startsWith?.("webgl.")) return ["WEBGL", index, safe(command.op), JSON.stringify(command).length].join("|");
  return null;
}

function n(value) { return Number(value || 0).toFixed(2); }
function safe(value) { return String(value || "").replace(/[|\r\n]/g, " ").slice(0, 120); }
function color(value) {
  const text = String(value || "#ffffff").trim().toLowerCase();
  const named = { black: "#000000", white: "#ffffff", red: "#ff0000", green: "#008000", blue: "#0000ff", transparent: "#ffffff", gray: "#808080", grey: "#808080", yellow: "#ffff00", orange: "#ffa500", purple: "#800080" };
  if (named[text]) return named[text];
  if (/^#[0-9a-f]{6}$/i.test(text)) return text;
  if (/^#[0-9a-f]{3}$/i.test(text)) return "#" + text.slice(1).split("").map(c => c + c).join("");
  const rgb = text.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(",").slice(0, 3).map(part => Math.max(0, Math.min(255, Number.parseFloat(part))));
    if (parts.length === 3 && parts.every(Number.isFinite)) return "#" + parts.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
  }
  return safe(text || "#ffffff");
}
