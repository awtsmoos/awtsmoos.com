//B"H
import { parseStreamChunk } from "./workerStreamClient.js";
import { streamResumeStore } from "./streamResumeStore.js";

const MAX_EVENT_SUMMARIES = 80;
const MAX_EVENT_TEXT = 1200;

/**
 * Chapter 103: The Stream Ledger Stopped Hoarding Mountains.
 *
 * Visible text flows live. Non-message packets are summarized into tiny event
 * capsules instead of keeping full raw provider/tool payloads in RAM until the
 * stream ends. The extension ledger remains the durable byte store; the page
 * keeps only what it needs to paint and finish the assistant vessel.
 */
export async function logStream(response, callback, context = {}) {
  const emit = typeof callback === "function" ? callback : () => {};
  if (!response.ok) return { message: "Something happened" };
  const streamId = response.id || response.streamId || response.metadata?.streamId;
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  const sessionId = `sse-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let cursor = 0;
  let message = null;
  const otherEvents = [];
  if (streamId) rememberStream(streamId, cursor, sessionId, context);
  while (true) {
    const { done, value } = await reader.read();
    const text = done ? "" : decoder.decode(value, { stream: true });
    const packets = await parseStreamChunk(sessionId, text, done);
    for (const packet of packets) collect(packet, emit, otherEvents, next => message = next, streamId);
    if (!done && streamId) streamResumeStore.patch(streamId, { cursor: ++cursor });
    if (done) {
      if (streamId) markStreamDone(streamId, message);
      if (message) message.awtsmoos = { otherEvents };
      return message;
    }
  }
}

function rememberStream(streamId, cursor, sessionId, context = {}) {
  streamResumeStore.upsert({
    id: streamId,
    cursor,
    sessionId,
    status: "streaming",
    conversationId: context.conversationId || null,
    surfaceConversationId: context.conversationId || null,
    title: context.title || "Streaming chat"
  });
}

function markStreamDone(streamId, message) {
  const conversationId = message?.conversation_id || message?.conversationId || null;
  streamResumeStore.patch(streamId, { status: "done", doneAt: Date.now(), conversationId: conversationId || undefined });
  setTimeout(() => streamResumeStore.remove(streamId), 20000);
}

function collect(packet, emit, otherEvents, setMessage, streamId) {
  const message = packet?.data?.message || packet?.message || packet?.data?.data?.message || null;
  if (message?.content?.parts) setMessage(message);
  else if (packet?.data) rememberEvent(otherEvents, packet.data);
  const conversationId = packet?.data?.conversation_id || packet?.conversation_id || message?.conversation_id;
  if (streamId && conversationId) streamResumeStore.patch(streamId, { conversationId });
  if (packet?.dataNoJSON !== "[DONE]" || packet.event) emit(packet);
}

function rememberEvent(events, raw = {}) {
  const event = compactEvent(raw);
  if (!event) return;
  events.push(event);
  if (events.length > MAX_EVENT_SUMMARIES) events.splice(0, events.length - MAX_EVENT_SUMMARIES);
}

function compactEvent(raw = {}) {
  const type = String(raw.type || raw.event || raw.kind || raw.message?.content?.content_type || "status");
  const id = raw.id || raw.message_id || raw.message?.id || raw.call_id || raw.tool_call_id || null;
  const text = String(raw.text || raw.message?.content?.text || raw.message?.content?.parts?.find?.(part => typeof part === "string") || raw.dataNoJSON || "").slice(0, MAX_EVENT_TEXT);
  const conversation_id = raw.conversation_id || raw.conversationId || null;
  if (!type && !id && !text) return null;
  return { type, id, text, conversation_id };
}
