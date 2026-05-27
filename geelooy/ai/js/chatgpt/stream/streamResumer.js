//B"H
import { streamResumeStore } from "./streamResumeStore.js";
import { waitForResumeFetcher } from "./resumeBridge.js";
import { closeVisibleScope, openVisibleScope, stopVisibleScope } from "./resumeScopeState.js";
import { resumeStreamLoop } from "./resumeLoop.js";

const activeResumes = new Set();

/**
 * B"H — Reattaches only the currently visible chat to background streams.
 *
 * The extension may preserve many rivers, but the page paints one river only:
 * the conversation visible in `/ai`. Every call stops the previous visible scope,
 * waits for the bridge, claims matching stream rows, and lets the worker parse
 * chunks off the main thread. Hidden chats remain durable but silent.
 *
 * @param {object} renderer Message renderer for the current chat surface.
 * @param {{maxPolls?:number,getActiveConversationId?:Function,onDone?:Function}} options Resume options.
 * @returns {{stop:Function}} Stop handle for this visible resume scope.
 */
export function resumeStoredStreams(renderer, { maxPolls = 900, getActiveConversationId = null, onDone = null } = {}) {
  const scope = openVisibleScope(getActiveConversationId);
  startVisibleResumes({ renderer, maxPolls, onDone, scope });
  return { stop: () => closeVisibleScope(scope) };
}

resumeStoredStreams.stopActive = () => stopVisibleScope();

async function startVisibleResumes({ renderer, maxPolls, onDone, scope }) {
  const fetcher = await waitForResumeFetcher();
  if (!fetcher?.resumeStream || scope.cancelled) return;
  for (const entry of streamResumeStore.list()) {
    if (!scope.owns(entry) || isClaimedByAnotherLiveTab(entry) || activeResumes.has(entry.id)) continue;
    activeResumes.add(entry.id);
    streamResumeStore.claim(entry.id);
    resumeStreamLoop({ fetcher, renderer, entry, maxPolls, onDone, scope }).finally(() => activeResumes.delete(entry.id));
  }
}

function isClaimedByAnotherLiveTab(entry) {
  if (!entry?.claimedBy || entry.claimedBy === streamResumeStore.tabId) return false;
  return Date.now() - Number(entry.claimedAt || 0) < 8000;
}
