//B"H
import { parseStreamChunk } from "./workerStreamClient.js";
import { streamResumeStore } from "./streamResumeStore.js";

/**
 * Chapter 37: The Stream Entered the Worker Furnace.
 *
 * The page reads bytes because the extension bridge lives on `window`, but the
 * worker parses SSE boundaries and JSON. While bytes pass through, this ledger
 * records the background stream id and cursor, so a refreshed page can ask the
 * extension for all sparks it has not yet seen.
 */
export async function logStream(response, callback) {
  const emit = typeof callback === "function" ? callback : () => {};
  if (!response.ok) return { message: "Something happened" };

  const streamId = response.id || response.streamId || response.metadata?.streamId;
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  const sessionId = `sse-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let cursor = 0;
  let message = null;
  const otherEvents = [];
  if (streamId) streamResumeStore.upsert({ id: streamId, cursor, sessionId });

  while (true) {
    const { done, value } = await reader.read();
    const text = done ? "" : decoder.decode(value, { stream: true });
    const packets = await parseStreamChunk(sessionId, text, done);
    for (const packet of packets) collect(packet, emit, otherEvents, value => message = value, streamId);
    if (!done && streamId) streamResumeStore.patch(streamId, { cursor: ++cursor });
    if (done) {
      if (streamId) streamResumeStore.remove(streamId);
      if (message) message.awtsmoos = { otherEvents };
      return message;
    }
  }
}

function collect(packet, emit, otherEvents, setMessage, streamId) {
  if (packet?.data?.message?.content?.parts) setMessage(packet.data.message);
  else if (packet?.data) otherEvents.push(packet.data);
  if (streamId && packet?.data?.conversation_id) streamResumeStore.patch(streamId, { conversationId: packet.data.conversation_id });
  if (packet?.dataNoJSON !== "[DONE]" || packet.event) emit(packet);
}
