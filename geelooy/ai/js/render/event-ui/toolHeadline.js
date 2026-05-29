//B"H
import { resolveToolName, resolveToolPayload, resolveToolPreview } from "../normalizer/toolNameResolver.js";

/**
 * Chapter 218: The Provider Tool Spoke Its Own Name.
 *
 * Provider-normalized tool events carry `raw.call.name`, `raw.request`, and
 * `raw.response`. The old headline only searched ChatGPT transport shapes, so
 * MiniMax tools appeared as the useless label `tool_call`. This crown now reads
 * provider events first, then falls back to the older transport resolvers.
 */
export function toolHeadline(event = {}) {
  const raw = event.raw || event;
  const provider = providerTool(raw);
  if (provider) return provider;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const payload = resolveToolPayload(raw, msg) || parsePayload(contentText(msg.content)) || raw;
  const preview = resolveToolPreview(raw, msg);
  const response = responsePayload(payload, raw);
  const action = firstValue(response.action, payload.action, preview?.params?.action, preview?.operation, raw.action, resolveToolName(raw, msg));
  const host = hostName(event, raw, msg, preview);
  return { action: actionLabel(event, action), target: targetFor(action, payload, response, preview), host, meta: metaFor(payload, response, preview) };
}

function providerTool(raw = {}) {
  if (!raw.providerEvent || !/tool|function/i.test(String(raw.type || ""))) return null;
  const call = raw.call || {};
  const args = raw.request || call.arguments || call.function?.arguments || {};
  const response = raw.response || {};
  const name = firstValue(call.name, call.function?.name, raw.name, raw.tool_call_id, raw.type);
  const action = /result/i.test(String(raw.type || "")) ? `response · ${name}` : name;
  return { action, target: targetFor(name, args, response, {}), host: raw.providerId || "provider", meta: metaFor(args, response, {}) };
}

function actionLabel(event, action) {
  return /tool_result$/.test(String(event.kind || "")) || event.kind === "tool_result" ? `response · ${action}` : action;
}

function hostName(event, raw, msg, preview) {
  return firstUseful(msg.author?.name, raw.author?.name, event.label, preview?.operation, resolveToolName(raw, msg), raw.type) || "tool";
}

function responsePayload(payload = {}, raw = {}) {
  return raw.type === "TUNNEL_RESPONSE" ? raw : (payload.type === "TUNNEL_RESPONSE" ? payload : raw);
}

function targetFor(action, payload = {}, raw = {}, preview = {}) {
  const params = preview?.params || {};
  if (payload.command || raw.command || params.command) return payload.command || raw.command || params.command;
  if (payload.url || raw.url || raw.finalUrl || params.url) return payload.url || raw.url || raw.finalUrl || params.url;
  if (payload.p || payload.path || raw.path || params.p || params.path) return payload.p || payload.path || raw.path || params.p || params.path;
  if (payload.cwd || raw.cwd || params.cwd) return payload.cwd || raw.cwd || params.cwd;
  if (payload.paths || params.paths) return summarizeList(payload.paths || params.paths, action);
  if (payload.files || params.files) return summarizeList(payload.files || params.files, action);
  return action;
}

function metaFor(payload = {}, raw = {}, preview = {}) {
  const params = preview?.params || {};
  const parts = [];
  const ok = raw.ok ?? payload.ok;
  const status = raw.status ?? payload.status;
  const bytes = raw.totalBytes ?? raw.bytes ?? payload.totalBytes ?? payload.bytes;
  const cwd = raw.cwd || payload.cwd || params.cwd;
  const method = preview?.method || payload.method || raw.method;
  if (ok !== undefined) parts.push(ok ? "OK" : "FAILED");
  if (status) parts.push(`status ${status}`);
  if (method) parts.push(String(method).toUpperCase());
  if (bytes) parts.push(`${bytes} bytes`);
  if (cwd) parts.push(`cwd ${cwd}`);
  return parts.join(" · ");
}

function contentText(content = {}) {
  if (typeof content.text === "string") return content.text;
  if (Array.isArray(content.parts)) return content.parts.map(part => typeof part === "string" ? part : part?.text || part?.summary || "").filter(Boolean).join("\n");
  return "";
}

function summarizeList(value, action) {
  const list = Array.isArray(value) ? value : String(value).split(/\n|,/).filter(Boolean);
  if (list.length <= 2) return list.join(", ");
  return `${list.length} targets ${action}`;
}

function parsePayload(text = "") {
  if (!text || typeof text !== "string") return null;
  try { return JSON.parse(text); } catch { return null; }
}

function firstValue(...values) {
  return values.map(value => String(value || "").trim()).find(Boolean) || "tool";
}

function firstUseful(...values) {
  return values.map(value => String(value || "").trim()).find(value => value && !/^(all|assistant|tool|next|null|undefined)$/i.test(value));
}
