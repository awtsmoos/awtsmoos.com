//B"H
import { renderMarkdown } from "../render/markdown.js";
import { downloadTextFile } from "../automation/messageArchive.js";
import { escapeHtml } from "../render/escapeHtml.js";

/**
 * Chapter 1: The RAM Conversation Became A Portable Scroll.
 *
 * The visible renderer already holds the loaded conversation in memory. This
 * exporter does not re-fetch, does not ask the provider, and does not scrape the
 * DOM. It walks the living records, renders safe markdown, and downloads one
 * standalone HTML file with the current chat text and lightweight trace counts.
 *
 * @param {object} renderer MessageRenderer with current RAM records.
 * @returns {void}
 */
export function downloadCurrentChatHtml(renderer) {
  const records = Array.isArray(renderer?.records) ? renderer.records : [];
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadTextFile(`awtsmoos-chat-${stamp}.html`, buildChatHtml(records), "text/html");
}

/**
 * Chapter 2: The Unfiltered Debug Scroll Refused To Wear A Mask.
 *
 * HTML is for reading; JSON is for truth surgery. This export preserves every
 * currently loaded renderer record with text, events, raw packet summaries,
 * prepared render shape, ids, roles, and live state flags for debugging.
 *
 * @param {object} renderer MessageRenderer with current RAM records.
 * @returns {void}
 */
export function downloadCurrentChatJson(renderer) {
  const records = Array.isArray(renderer?.records) ? renderer.records : [];
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const payload = { exportedAt: new Date().toISOString(), count: records.length, records: records.map(serializeRecord) };
  downloadTextFile(`awtsmoos-chat-debug-${stamp}.json`, JSON.stringify(payload/*NO PADDING*/), "application/json");
}

/**
 * Chapter 2: The Unfiltered Debug Scroll Refused To Wear A Mask.
 *
 * HTML is for reading; JSON is for truth surgery. This export preserves every
 * currently loaded renderer record with text, events, raw packet summaries,
 * prepared render shape, ids, roles, and live state flags for debugging.
 *
 * @param {object} renderer MessageRenderer with current RAM records.
 * @returns {void}
 */


function buildChatHtml(records) {
  const body = records.filter(record => record?.text || record?.events?.length).map(renderRecord).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Awtsmoos Chat Export</title><style>${style()}</style></head><body><main><h1>Awtsmoos Chat Export</h1>${body || "<p>No messages loaded in RAM.</p>"}</main></body></html>`;
}

function serializeRecord(record = {}) {
  return {
    id: record.id || null,
    role: record.role || null,
    text: record.text || "",
    events: Array.isArray(record.events) ? record.events : [],
    raw: record.raw ?? null,
    prepared: record.prepared ?? null,
    loading: Boolean(record.loading),
    streaming: Boolean(record.streaming),
    expanded: Boolean(record.expanded),
    message: record.message ?? null
  };
}

function renderRecord(record) {
  const role = escapeHtml(record.role || "assistant");
  const text = renderMarkdown(String(record.text || ""));
  const eventCount = Array.isArray(record.events) ? record.events.length : 0;
  const meta = eventCount ? `<div class="meta">${eventCount} trace event(s)</div>` : "";
  return `<article class="msg ${role}"><header>${role}</header><section>${text}</section>${meta}</article>`;
}

function style() {
  return `body{margin:0;background:#07111f;color:#e5f7ff;font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif}main{max-width:920px;margin:auto;padding:24px}.msg{margin:14px 0;padding:16px 18px;border:1px solid #21435a;border-radius:18px;background:#0c1a2b}.msg.user{background:#12345b}.msg header{font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:#7dd3fc}.msg section{white-space:pre-wrap;overflow-wrap:anywhere}.msg pre{overflow:auto;padding:12px;border-radius:12px;background:#020617}.msg code{overflow-wrap:anywhere}.msg a{color:#67e8f9}.meta{margin-top:10px;color:#a8c7d8;font-size:.85rem}`;
}
