//B"H
import { StreamRouter } from "../../app/streamRouter.js";
import { parseStreamChunk } from "./workerStreamClient.js";
import { streamResumeStore } from "./streamResumeStore.js";

const activeResumes = new Set();

/**
 * B"H — Reattaches a refreshed page to background-owned streams.
 *
 * A refreshed page has no DOM for chunks it rendered before the refresh, so it
 * must replay the visible stream from the extension ledger's earliest available
 * chunk, not from the old tab's saved cursor. The saved cursor remains useful as
 * a heartbeat/progress marker, but the reborn page rebuilds the current answer.
 */
export async function resumeStoredStreams(renderer, { maxPolls = 900, getActiveConversationId = null, onDone = null } = {}) {
  const fetcher = await waitForResumeFetcher();
  if (!fetcher?.resumeStream) return;
  for (const entry of streamResumeStore.list()) {
    if (!shouldRenderEntry(entry, getActiveConversationId)) continue;
    if (isClaimedByAnotherLiveTab(entry)) continue;
    if (activeResumes.has(entry.id)) continue;
    activeResumes.add(entry.id);
    streamResumeStore.claim(entry.id);
    resumeOne(fetcher, renderer, entry, maxPolls, onDone).finally(() => activeResumes.delete(entry.id));
  }
}

async function resumeOne(fetcher, renderer, entry, maxPolls, onDone) {
  const router = new StreamRouter(renderer);
  const sessionId = `resume-${entry.id}-${Date.now()}`;
  let cursor = 0;
  let warnedTruncation = false;
  let finalText = "";
  for (let polls = 0; polls < maxPolls; polls++) {
    const packet = await safeResume(fetcher, entry.id, cursor);
    if (!packet) return streamResumeStore.release(entry.id);
    if (packet.truncated && !warnedTruncation) {
      warnedTruncation = true;
      await router.route({ type: "stream_replay_truncated", dataNoJSON: `Earlier live chunks were trimmed to protect memory; replay resumes from chunk ${packet.baseIndex || 0}.` });
    }
    for (const chunk of orderedChunks(packet.chunks)) {
      const text = await dataUrlText(chunk.chunk);
      for (const parsed of await parseStreamChunk(sessionId, text, false)) {
        await router.route(parsed);
        finalText = extractAssistantText(parsed) || finalText;
      }
      cursor = Math.max(cursor, Number(chunk.index || 0) + 1);
      streamResumeStore.patch(entry.id, { cursor, replayCursor: cursor, status: "streaming", lastPollAt: Date.now() });
      safeAck(fetcher, entry.id, cursor);
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
      onDone?.(finalText, { conversationId: entry.conversationId || entry.surfaceConversationId, streamId: entry.id });
      return;
    }
    await sleep(packet.chunks?.length ? 80 : 1000);
  }
  streamResumeStore.release(entry.id);
}

function orderedChunks(chunks = []) {
  return [...(Array.isArray(chunks) ? chunks : [])].sort((a, b) => Number(a?.index || 0) - Number(b?.index || 0));
}

/**
 * B"H — decides whether a reborn page may repaint a living stream.
 *
 * Refreshing the bare AI app with no awtsmoosConversation query string must not
 * resurrect some unrelated background river. Only a URL-bound conversation is a
 * clear vessel for replay; otherwise the Awtsmoos lets the stream remain hidden
 * in the durable ledger until its own chat is opened.
 *
 * @param {object} entry Active stream ledger entry.
 * @param {Function|null} getActiveConversationId Reads the URL-owned chat id.
 * @returns {boolean} True when this tab may visibly replay the stream.
 */
function shouldRenderEntry(entry, getActiveConversationId) {
  if (typeof getActiveConversationId !== "function") return false;
  const active = getActiveConversationId();
  if (!active) return false;
  const owner = entry?.conversationId || entry?.surfaceConversationId;
  return Boolean(owner && owner === active);
}

function isClaimedByAnotherLiveTab(entry) {
  if (!entry?.claimedBy || entry.claimedBy === streamResumeStore.tabId) return false;
  return Date.now() - Number(entry.claimedAt || 0) < 8000;
}

async function waitForResumeFetcher(timeout = 16000) {
  const first = resumeFetcher();
  if (first) return first;
  const started = Date.now();
  while (Date.now() - started < timeout) {
    await onceBridgeSignal(250);
    const found = resumeFetcher();
    if (found) return found;
  }
  return resumeFetcher();
}

function resumeFetcher() {
  const fetcher = window.awtsmoosFetch || window.mFetch;
  return typeof fetcher?.resumeStream === "function" ? fetcher : null;
}

function onceBridgeSignal(ms) {
  return new Promise(resolve => {
    const timer = setTimeout(done, ms);
    function done() {
      clearTimeout(timer);
      window.removeEventListener("awtsmoos-server-ready", done);
      window.removeEventListener("message", onMessage);
      resolve();
    }
    function onMessage(event) {
      if (event?.data?.from === "awtsmoos-content" && /server-(ready|message)/.test(event.data.type || "")) done();
    }
    window.addEventListener("awtsmoos-server-ready", done, { once: true });
    window.addEventListener("message", onMessage);
  });
}

async function safeResume(fetcher, id, cursor) {
  try { return await fetcher.resumeStream(id, cursor); }
  catch { return null; }
}

function safeAck(fetcher, id, cursor) {
  try { Promise.resolve(fetcher.ackStream?.(id, cursor)).catch(() => null); } catch {}
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
