//B"H
import { StreamRouter } from "../../app/streamRouter.js";
import { parseStreamChunk } from "./workerStreamClient.js";
import { streamResumeStore } from "./streamResumeStore.js";

/**
 * B"H — Reattaches a refreshed page to background-owned streams.
 *
 * The stream id/cursor ledger is durable now. A reopened tab can claim the
 * visible stream and render it. Other tabs still see badges from localStorage,
 * but they do not all consume and paint the same stream at once.
 */
export async function resumeStoredStreams(renderer, { maxPolls = 900, getActiveConversationId = null, onDone = null } = {}) {
  const fetcher = window.awtsmoosFetch || window.mFetch;
  if (!fetcher?.resumeStream) return;
  for (const entry of streamResumeStore.list()) {
    if (!shouldRenderEntry(entry, getActiveConversationId)) continue;
    if (isClaimedByAnotherLiveTab(entry)) continue;
    streamResumeStore.claim(entry.id);
    resumeOne(fetcher, renderer, entry, maxPolls, onDone);
  }
}

async function resumeOne(fetcher, renderer, entry, maxPolls, onDone) {
  const router = new StreamRouter(renderer);
  const sessionId = `resume-${entry.id}-${Date.now()}`;
  let cursor = Number(entry.cursor || 0);
  let finalText = "";
  for (let polls = 0; polls < maxPolls; polls++) {
    const packet = await safeResume(fetcher, entry.id, cursor);
    if (!packet) return streamResumeStore.remove(entry.id);
    for (const chunk of packet.chunks || []) {
      const text = await dataUrlText(chunk.chunk);
      cursor = Math.max(cursor, Number(chunk.index || 0) + 1);
      streamResumeStore.patch(entry.id, { cursor, status: "streaming", lastPollAt: Date.now() });
      for (const parsed of await parseStreamChunk(sessionId, text, false)) {
        await router.route(parsed);
        finalText = extractAssistantText(parsed) || finalText;
      }
    }
    if (packet.done) {
      const finalPackets = await parseStreamChunk(sessionId, "", true);
      if (finalPackets.length) {
        for (const parsed of finalPackets) {
          await router.finish(parsed);
          finalText = extractAssistantText(parsed) || finalText;
        }
      } else await router.finish({ dataNoJSON: "[DONE]" });
      streamResumeStore.remove(entry.id);
      onDone?.(finalText, { conversationId: entry.conversationId, streamId: entry.id });
      return;
    }
    await sleep(packet.chunks?.length ? 80 : 1000);
  }
}

function shouldRenderEntry(entry, getActiveConversationId) {
  if (typeof getActiveConversationId !== "function") return true;
  const active = getActiveConversationId();
  return Boolean(active && entry?.conversationId && active === entry.conversationId);
}

function isClaimedByAnotherLiveTab(entry) {
  if (!entry?.claimedBy || entry.claimedBy === streamResumeStore.tabId) return false;
  return Date.now() - Number(entry.claimedAt || 0) < 8000;
}

async function safeResume(fetcher, id, cursor) {
  try { return await fetcher.resumeStream(id, cursor); }
  catch { return null; }
}

async function dataUrlText(url) {
  const blob = await (await fetch(url)).blob();
  return new TextDecoder("utf-8").decode(await blob.arrayBuffer());
}

function extractAssistantText(packet) {
  if (typeof packet === "string") return packet;
  return packet?.content?.parts?.[0] || packet?.message?.content?.parts?.[0] || packet?.data?.message?.content?.parts?.[0] || packet?.text || "";
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
