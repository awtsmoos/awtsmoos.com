//B"H
import { StreamRouter } from "../../app/streamRouter.js";
import { parseStreamChunk } from "./workerStreamClient.js";
import { streamResumeStore } from "./streamResumeStore.js";

/**
 * B"H — Reattaches a refreshed page to background-owned streams.
 *
 * The background service worker keeps indexed byte chunks. This runner asks for
 * all chunks after the remembered cursor, feeds them through the same SSE worker
 * parser, and routes packets through the same UI stream router.
 */
export async function resumeStoredStreams(renderer, { maxPolls = 900 } = {}) {
  const fetcher = window.awtsmoosFetch || window.mFetch;
  if (!fetcher?.resumeStream) return;
  for (const entry of streamResumeStore.list()) resumeOne(fetcher, renderer, entry, maxPolls);
}

async function resumeOne(fetcher, renderer, entry, maxPolls) {
  const router = new StreamRouter(renderer);
  const sessionId = `resume-${entry.id}-${Date.now()}`;
  let cursor = Number(entry.cursor || 0);
  for (let polls = 0; polls < maxPolls; polls++) {
    const packet = await safeResume(fetcher, entry.id, cursor);
    if (!packet) return streamResumeStore.remove(entry.id);
    for (const chunk of packet.chunks || []) {
      const text = await dataUrlText(chunk.chunk);
      cursor = Math.max(cursor, Number(chunk.index || 0) + 1);
      streamResumeStore.patch(entry.id, { cursor });
      for (const parsed of await parseStreamChunk(sessionId, text, false)) await router.route(parsed);
    }
    if (packet.done) {
      const finalPackets = await parseStreamChunk(sessionId, "", true);
      if (finalPackets.length) for (const parsed of finalPackets) await router.finish(parsed);
      else await router.finish({ dataNoJSON: "[DONE]" });
      streamResumeStore.remove(entry.id);
      return;
    }
    await sleep(packet.chunks?.length ? 80 : 1000);
  }
}

async function safeResume(fetcher, id, cursor) {
  try { return await fetcher.resumeStream(id, cursor); }
  catch { return null; }
}

async function dataUrlText(url) {
  const blob = await (await fetch(url)).blob();
  return new TextDecoder("utf-8").decode(await blob.arrayBuffer());
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
