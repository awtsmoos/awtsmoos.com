//B"H
import { parseStreamDeltas, parseStreamDataUrlDeltas } from "./workerStreamClient.js";
import { streamResumeStore } from "./streamResumeStore.js";
import { cursorAfterChunk, orderedChunks } from "./resumePacketOrder.js";
import { ResumeDeltaRouter } from "./resumeDeltaRouter.js";

const QUIET_POLL_MS = 1800;
const ACTIVE_POLL_MS = 60;
const QUIET_NOTICE_MS = 60000;

/**
 * Chapter 102: The Silent River Was Not Declared Dead.
 *
 * Long ChatGPT responses can pause while tools, image/file work, or server-side
 * reasoning continues. This loop no longer turns silence into completion. It
 * backs off polling, releases RAM through cursor acks, and waits for the ledger's
 * explicit `done` flag before finalizing the visible assistant vessel.
 */
export async function resumeStreamLoop({ fetcher, renderer, entry, maxPolls = 18000, onDone, scope }) {
  const router = new ResumeDeltaRouter(renderer);
  const sessionId = `resume-${entry.id}-${Date.now()}`;
  let cursor = Number(entry.replayCursor || entry.cursor || 0);
  let finalText = "";
  let warnedTruncation = false;
  let lastChunkAt = Date.now();
  let lastNoticeAt = 0;
  for (let polls = 0; polls < maxPolls; polls++) {
    if (!scope?.owns?.(entry)) return streamResumeStore.release(entry.id);
    const packet = await safeResume(fetcher, entry.id, cursor);
    if (!packet) {
      await sleep(QUIET_POLL_MS);
      continue;
    }
    if (packet.truncated && !warnedTruncation) {
      warnedTruncation = true;
      await router.route({ kind: "event", event: { kind: "status", label: "Replay trimmed", text: `Earlier live chunks were trimmed; replay resumes from chunk ${packet.baseIndex || 0}.`, raw: null } });
    }
    const chunks = orderedChunks(packet.chunks);
    if (chunks.length) lastChunkAt = Date.now();
    for (const chunk of chunks) {
      for (const delta of await parseStreamDataUrlDeltas(sessionId, chunk.chunk, false)) finalText = await router.route(delta) || finalText;
      cursor = cursorAfterChunk(cursor, chunk);
      streamResumeStore.patch(entry.id, { cursor, replayCursor: cursor, status: "streaming", lastPollAt: Date.now() });
      safeAck(fetcher, entry.id, cursor);
    }
    if (packet.done) return finishResume({ router, sessionId, entry, onDone, finalText });
    const quietFor = Date.now() - lastChunkAt;
    if (!chunks.length && quietFor > QUIET_NOTICE_MS && Date.now() - lastNoticeAt > QUIET_NOTICE_MS) {
      lastNoticeAt = Date.now();
      await router.route({ kind: "event", event: { kind: "status", label: "Stream still alive", text: `Waiting for more stream data after ${Math.round(quietFor / 1000)}s…`, raw: null } });
    }
    await sleep(chunks.length ? ACTIVE_POLL_MS : QUIET_POLL_MS);
  }
  streamResumeStore.release(entry.id);
}

async function finishResume({ router, sessionId, entry, onDone, finalText }) {
  for (const delta of await parseStreamDeltas(sessionId, "", true)) finalText = await router.route(delta) || finalText;
  await router.finish();
  streamResumeStore.remove(entry.id);
  onDone?.(finalText, { conversationId: entry.conversationId || entry.surfaceConversationId, streamId: entry.id });
}

async function safeResume(fetcher, id, cursor) {
  try { return await fetcher.resumeStream(id, cursor); }
  catch { return null; }
}

function safeAck(fetcher, id, cursor) {
  try { Promise.resolve(fetcher.ackStream?.(id, cursor)).catch(() => null); } catch {}
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
