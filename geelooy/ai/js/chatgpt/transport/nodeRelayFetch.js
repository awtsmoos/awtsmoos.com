//B"H
import { loadNodeRelaySettings } from "./nodeRelaySettings.js";

/**
 * Chapter 70: The Browser Waited Like The Extension Waited.
 *
 * The relay may answer `pending` while the Awtsmoos stream is still carving a
 * byte from the hidden river. This fetch wrapper mirrors the extension: it
 * preserves method/headers/body, waits, asks again, and only ends when the
 * relay says the stream is truly done.
 *
 * @param {string|URL} url Target URL.
 * @param {RequestInit} options Fetch options.
 * @returns {Promise<NodeRelayResponse>} Fetch-shaped streaming response.
 */
export async function nodeRelayFetch(url, options = {}) {
  const relay = relayUrl();
  const response = await fetch(`${relay}/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: String(url), options: await serializeOptions(options) })
  });
  if (!response.ok) throw new Error(`Node relay failed: ${response.status} ${await response.text()}`);
  const metadata = await response.json();
  if (metadata.error) throw new Error(metadata.error);
  return new NodeRelayResponse(metadata, relay);
}

nodeRelayFetch.resumeStream = async function resumeStream(id, cursor = 0) {
  return await relayBody("resume", id, { cursor });
};

export async function checkNodeRelay() {
  try { return (await fetch(`${relayUrl()}/health`, { cache: "no-store" })).ok; }
  catch { return false; }
}

export async function openRelayLogin() {
  return await openRelayControl();
}

export async function openRelayControl() {
  const base = relayUrl();
  let url = `${base}/control`;
  try {
    const response = await fetch(`${base}/control-url`, { cache: "no-store" });
    const data = await response.json();
    if (data?.url) url = data.url;
  } catch {}
  globalThis.open?.(url, "_blank", "noopener,noreferrer");
  return url;
}

class NodeRelayResponse {
  constructor(metadata, relay) {
    Object.assign(this, metadata);
    this.id = metadata.streamId || metadata.id;
    this.streamId = this.id;
    this.relay = relay;
    this.bodyUsed = false;
    this.headers = new Headers(Array.isArray(metadata.headers) ? metadata.headers : []);
  }

  clone() { return new NodeRelayResponse({ ...this, headers: Array.from(this.headers.entries()) }, this.relay); }
  async text() { this.bodyUsed = true; return await relayBody("text", this.id); }
  async json() { return JSON.parse(await this.text()); }
  async blob() { return await (await fetch(await relayBody("blob", this.id))).blob(); }
  get body() { return { getReader: () => createBodyReader(this.id) }; }
}

function createBodyReader(id) {
  let done = false;
  let cursor = 0;
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
    const packet = await relayBody("read", id, { cursor });
    if (!packet?.pending) return packet;
    await sleep(Math.min(packet.retryAfter || 750, 5000));
  }
}

async function relayBody(bodyAction, id, extra = {}) {
  const response = await fetch(`${relayUrl()}/body`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, bodyAction, ...extra })
  });
  if (!response.ok) throw new Error(`Node relay body failed: ${response.status} ${await response.text()}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

async function dataUrlBytes(url) {
  const blob = await (await fetch(url)).blob();
  return new Uint8Array(await blob.arrayBuffer());
}

async function serializeOptions(options = {}) {
  const headers = new Headers(options.headers || {});
  const body = await serializeBody(options.body, headers);
  return { method: options.method || "GET", headers: Object.fromEntries(headers.entries()), body };
}

async function serializeBody(body, headers) {
  if (body == null) return undefined;
  if (typeof body === "string") return body;
  if (body instanceof URLSearchParams) {
    if (!headers.has("content-type")) headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
    return body.toString();
  }
  if (body instanceof FormData || body instanceof Blob) {
    const response = new Response(body);
    response.headers.forEach((value, key) => { if (!headers.has(key)) headers.set(key, value); });
    return { type: "base64", data: await bufferToBase64(await response.arrayBuffer()) };
  }
  if (body instanceof ArrayBuffer) return { type: "base64", data: await bufferToBase64(body) };
  if (ArrayBuffer.isView(body)) return { type: "base64", data: await bufferToBase64(body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)) };
  return String(body);
}

async function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) binary += String.fromCharCode(...bytes.subarray(i, i + step));
  return btoa(binary);
}

function relayUrl() { return loadNodeRelaySettings().url.replace(/\/+$/, ""); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
