//B"H
import { isTunnelRelayEnabled, loadNodeRelaySettings } from "./nodeRelaySettings.js";

/**
 * Chapter 10: The Tunnel Became A ChatGPT Transport.
 *
 * This fetcher speaks to the Awtsmoos Tunnel local API. It uses the tunnel's
 * relay feature for ChatGPT fetch/body streams and can ask the tunnel to open
 * ChatGPT login, with MerkavaExecutor as a non-Chrome diagnostic fallback.
 *
 * @param {string|URL} url ChatGPT URL to fetch.
 * @param {RequestInit} options Fetch options.
 * @returns {Promise<TunnelRelayResponse>} Fetch-like response backed by tunnel streams.
 */
export async function tunnelRelayFetch(url, options = {}) {
  if (!isTunnelRelayEnabled()) throw new Error("Awtsmoos Tunnel relay is not enabled.");
  const base = tunnelUrl();
  const response = await fetch(`${base}/relay/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: String(url), options: await serializeOptions(options) })
  });
  if (!response.ok) throw new Error(`Tunnel relay failed: ${response.status} ${await response.text()}`);
  const metadata = await response.json();
  if (metadata.error) throw new Error(metadata.error);
  return new TunnelRelayResponse(metadata, base);
}

tunnelRelayFetch.resumeStream = async function resumeStream(id, cursor = 0) {
  return await tunnelBody("resume", id, { cursor });
};
tunnelRelayFetch.ackStream = async function ackStream(id, cursor = 0) { return { ok: true, id, cursor }; };
tunnelRelayFetch.startBackgroundAutomation = async function startBackgroundAutomation(payload = {}) { return await tunnelTool({ action: "relayHealth", payload }); };
tunnelRelayFetch.stopBackgroundAutomation = async function stopBackgroundAutomation(reason = "stopped", conversationId = null) { return { ok: true, reason, conversationId, tunnel: true }; };
tunnelRelayFetch.backgroundAutomationStatus = async function backgroundAutomationStatus(conversationId = null) { return { ok: true, tunnel: true, conversationId, status: "local tunnel selected" }; };
tunnelRelayFetch.backgroundAutomationEvents = async function backgroundAutomationEvents() { return { ok: true, events: [] }; };

export async function checkTunnelRelay({ ignoreEnabled = false } = {}) {
  if (!ignoreEnabled && !isTunnelRelayEnabled()) return false;
  try { return (await fetch(`${tunnelUrl()}/relay/health`, { cache: "no-store" })).ok; }
  catch { return false; }
}

export async function openTunnelRelayLogin() {
  const response = await fetch(`${tunnelUrl()}/relay/open-login`, { cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) throw new Error(data.error || `Tunnel login failed: ${response.status}`);
  return data;
}

export async function tryTunnelMerkavaLogin() {
  const settings = loadNodeRelaySettings();
  if (!settings.useMerkavaExecutor) return { ok: false, skipped: true, reason: "MerkavaExecutor fallback disabled" };
  const response = await fetch(`${tunnelUrl()}/tool`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "fs", action: "simulateRuntime", runtime: "browser", engine: "merkava", url: "https://chatgpt.com", p: ".", timeoutMs: 240000, maxFiles: 20, returnValues: ["document.title", "location.href"] })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) throw new Error(data.error || `MerkavaExecutor failed: ${response.status}`);
  return data;
}

class TunnelRelayResponse {
  constructor(metadata, base) {
    Object.assign(this, metadata);
    this.id = metadata.streamId || metadata.id;
    this.streamId = this.id;
    this.base = base;
    this.bodyUsed = false;
    this.headers = new Headers(Array.isArray(metadata.headers) ? metadata.headers : []);
  }
  clone() { return new TunnelRelayResponse({ ...this, headers: Array.from(this.headers.entries()) }, this.base); }
  async text() { this.bodyUsed = true; return await tunnelBody("text", this.id); }
  async json() { return JSON.parse(await this.text()); }
  async blob() { return await (await fetch(await tunnelBody("blob", this.id))).blob(); }
  get body() { return { getReader: () => createBodyReader(this.id) }; }
}

function createBodyReader(id) {
  let done = false, cursor = 0;
  return { read: async () => {
    if (done) return { done: true, value: undefined };
    const packet = await readReadyChunk(id, cursor);
    cursor = packet?.index !== undefined ? packet.index + 1 : cursor + 1;
    if (packet?.done || !packet?.chunk) { done = true; return { done: true, value: undefined }; }
    return { done: false, value: await dataUrlBytes(packet.chunk) };
  }};
}

async function readReadyChunk(id, cursor) {
  for (;;) {
    const packet = await tunnelBody("read", id, { cursor });
    if (!packet?.pending) return packet;
    await sleep(Math.min(packet.retryAfter || 750, 5000));
  }
}
async function tunnelBody(bodyAction, id, extra = {}) {
  const response = await fetch(`${tunnelUrl()}/relay/body`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, bodyAction, ...extra }) });
  if (!response.ok) throw new Error(`Tunnel relay body failed: ${response.status} ${await response.text()}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}
async function tunnelTool(payload = {}) {
  const response = await fetch(`${tunnelUrl()}/tool`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "relay", ...payload }) });
  if (!response.ok) throw new Error(`Tunnel tool failed: ${response.status} ${await response.text()}`);
  return await response.json();
}
async function serializeOptions(options = {}) { const headers = new Headers(options.headers || {}); return { method: options.method || "GET", headers: Object.fromEntries(headers.entries()), body: await serializeBody(options.body, headers) }; }
async function serializeBody(body, headers) { if (body == null) return undefined; if (typeof body === "string") return body; if (body instanceof URLSearchParams) { if (!headers.has("content-type")) headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"); return body.toString(); } if (body instanceof FormData || body instanceof Blob) { const response = new Response(body); response.headers.forEach((value, key) => { if (!headers.has(key)) headers.set(key, value); }); return { type: "base64", data: await bufferToBase64(await response.arrayBuffer()) }; } if (body instanceof ArrayBuffer) return { type: "base64", data: await bufferToBase64(body) }; if (ArrayBuffer.isView(body)) return { type: "base64", data: await bufferToBase64(body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)) }; return String(body); }
async function bufferToBase64(buffer) { const bytes = new Uint8Array(buffer); let binary = ""; const step = 0x8000; for (let i = 0; i < bytes.length; i += step) binary += String.fromCharCode(...bytes.subarray(i, i + step)); return btoa(binary); }
async function dataUrlBytes(url) { const blob = await (await fetch(url)).blob(); return new Uint8Array(await blob.arrayBuffer()); }
function tunnelUrl() { return loadNodeRelaySettings().tunnelUrl.replace(/\/+$/, ""); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
