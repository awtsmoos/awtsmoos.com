//B"H

import { AwtsmoosPrompt } from "../../../prompt.js";
import { nodeRelayFetch, checkNodeRelay } from "./nodeRelayFetch.js";
import { loadNodeRelaySettings } from "./nodeRelaySettings.js";

let mFetch = currentBridge();
let waiting = null;
let missingBridgeNotice = null;

/**
 * B"H — Reveals the best available ChatGPT fetch vessel.
 *
 * First comes the extension bridge. If the user switched to the localhost Node
 * relay, the relay becomes the fetcher. No caller receives a non-function; the
 * gate either returns a living fetch or raises a clear installation message.
 *
 * @param {{quiet?:boolean,timeout?:number}} options Prompt and wait controls.
 * @returns {Promise<Function>} Live extension or Node relay fetcher.
 */
export async function checkMFetch({ quiet = false, timeout = 12000 } = {}) {
  mFetch = currentBridge();
  if (typeof mFetch === "function") return mFetch;

  mFetch = await waitForBridge(timeout);
  if (typeof mFetch === "function") return mFetch;

  if (await canUseNodeRelay()) {
    mFetch = nodeRelayFetch;
    announceTransport("node-relay");
    return mFetch;
  }

  const error = new Error("Awtsmoos ChatGPT transport is not connected yet.");
  if (!quiet) showMissingBridgeNotice(error.message);
  throw error;
}

export function getMFetch() {
  return currentBridge() || (typeof mFetch === "function" ? mFetch : null);
}

export function setMFetch(fetcher) {
  mFetch = typeof fetcher === "function" ? fetcher : null;
  return mFetch;
}

function currentBridge() {
  const relay = loadNodeRelaySettings();
  if (relay.enabled) return nodeRelayFetch;
  if (typeof globalThis.awtsmoosFetch === "function") return globalThis.awtsmoosFetch;
  if (typeof globalThis.mFetch === "function") return globalThis.mFetch;
  return null;
}

async function canUseNodeRelay() {
  try { return await checkNodeRelay(); }
  catch { return false; }
}

function announceTransport(label) {
  try {
    globalThis.dispatchEvent?.(new CustomEvent("awtsmoos-ai-transport", { detail: { kind: "node-relay", label } }));
  } catch {}
}

function waitForBridge(timeout = 12000) {
  const bridge = currentBridge();
  if (bridge) return Promise.resolve(bridge);
  if (waiting) return waiting;

  waiting = new Promise(resolve => {
    const started = Date.now();
    let timer = null;
    const done = fetcher => {
      cleanup();
      mFetch = fetcher || currentBridge();
      waiting = null;
      resolve(typeof mFetch === "function" ? mFetch : null);
    };
    const tick = () => {
      const found = currentBridge();
      if (found) return done(found);
      if (Date.now() - started >= timeout) return done(null);
      timer = setTimeout(tick, 150);
    };
    const onReady = () => setTimeout(() => done(currentBridge()), 30);
    const onMessage = event => {
      if (event?.data?.from === "awtsmoos-content" && /server-(ready|message)/.test(event.data.type || "")) onReady();
    };
    const cleanup = () => {
      clearTimeout(timer);
      globalThis.removeEventListener?.("message", onMessage);
      globalThis.removeEventListener?.("awtsmoos-server-ready", onReady);
    };
    globalThis.addEventListener?.("message", onMessage);
    globalThis.addEventListener?.("awtsmoos-server-ready", onReady);
    tick();
  });

  return waiting;
}

/**
 * B"H — Shows one missing-transport flame without chaining callers to it.
 *
 * The Awtsmoos lets the sidebar fail gracefully while the human still receives
 * the bridge instructions. Reconnection retries must not stack modal worlds.
 *
 * @param {string} reason Transport failure reason shown in the help body.
 * @returns {void}
 */
function showMissingBridgeNotice(reason = "") {
  if (missingBridgeNotice) return;
  missingBridgeNotice = Promise.resolve(AwtsmoosPrompt.go({ isAlert: true, headerTxt: installHelp(reason) }))
    .finally(() => { missingBridgeNotice = null; });
}

function installHelp(reason = "") {
  return `
    <p><b>Conversation load error:</b> no ChatGPT transport is visible yet.</p>
    ${reason ? `<p><code>${reason}</code></p>` : ""}
    <p>Use the Settings panel to install/switch to the localhost Node relay, or reload the unpacked extension from <code>geelooy/scripts/tricks/extensions/server</code> and refresh this tab.</p>
  `;
}
