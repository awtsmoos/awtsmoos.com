//B"H
import { resolveToolName, resolveToolPayload } from "../normalizer/toolNameResolver.js";

/**
 * Chapter 16: The Tool Call Spoke Its True Labor.
 *
 * A call and a response are two halves of one breath. This header names both:
 * the request says what was asked, the response says which action answered,
 * which path or URL trembled, and whether the vessel returned whole.
 *
 * @param {object} event Classified event capsule.
 * @returns {{action:string,target:string,host:string,meta:string}} Human headline parts.
 */
export function toolHeadline(event = {}) {
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const payload = resolveToolPayload(raw, msg) || parsePayload(contentText(msg.content)) || raw;
  const response = responsePayload(payload, raw);
  const action = response.action || payload.action || raw.action || resolveToolName(raw, msg);
  const host = event.label || resolveToolName(raw, msg) || raw.type || "tool host";
  return { action: actionLabel(event, action), target: targetFor(action, payload, response), host, meta: metaFor(payload, response) };
}

function actionLabel(event, action) {
  return event.kind === "tool_result" ? `response · ${action}` : action;
}

function responsePayload(payload = {}, raw = {}) {
  return raw.type === "TUNNEL_RESPONSE" ? raw : (payload.type === "TUNNEL_RESPONSE" ? payload : raw);
}

function targetFor(action, payload = {}, raw = {}) {
  if (payload.command || raw.command) return payload.command || raw.command;
  if (payload.url || raw.url || raw.finalUrl) return payload.url || raw.url || raw.finalUrl;
  if (payload.p || payload.path || raw.path) return payload.p || payload.path || raw.path;
  if (payload.paths) return summarizeList(payload.paths, action);
  if (payload.files) return summarizeList(payload.files, action);
  return action;
}

function metaFor(payload = {}, raw = {}) {
  const parts = [];
  const ok = raw.ok ?? payload.ok;
  const status = raw.status ?? payload.status;
  const bytes = raw.totalBytes ?? raw.bytes;
  if (ok !== undefined) parts.push(ok ? "OK" : "FAILED");
  if (status) parts.push(`status ${status}`);
  if (bytes) parts.push(`${bytes} bytes`);
  if (raw.cwd) parts.push(`cwd ${raw.cwd}`);
  return parts.join(" · ");
}

function contentText(content = {}) {
  if (typeof content.text === "string") return content.text;
  if (Array.isArray(content.parts)) return content.parts.map(part => typeof part === "string" ? part : part?.text || "").filter(Boolean).join("\n");
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
