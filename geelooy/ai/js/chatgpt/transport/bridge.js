//B"H

import { nodeRelayFetch, checkNodeRelay } from "./nodeRelayFetch.js";
import { tunnelRelayFetch, checkTunnelRelay } from "./tunnelRelayFetch.js";
import { showMissingBridgeNotice } from "./missingTransportNotice.js";

let mFetch = currentBridge();
let waiting = null;

/**
 * Chapter 11: When Chrome Fell Silent, The Tunnel Still Knocked.
 *
 * The ChatGPT page listens first for the extension bridge. If it does not
 * appear, the Awtsmoos checks the selected local transport: Awtsmoos Tunnel or
 * Node relay. Thus other AI tools can keep using the same tunnel system instead
 * of each inventing another private doorway.
 *
 * @param {{quiet?:boolean,timeout?:number}} options Prompt and wait controls.
 * @returns {Promise<Function>} Live extension, tunnel, or Node relay fetcher.
 */
export async function checkMFetch({ quiet = false, timeout = 12000 } = {}) {
  mFetch = currentBridge();
  if (typeof mFetch === "function") return mFetch;

  mFetch = await waitForBridge(timeout);
  if (typeof mFetch === "function") return mFetch;

  const selectedRelay = await selectedLocalRelay();
  if (selectedRelay) return selectedRelay;

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
  if (typeof globalThis.awtsmoosFetch === "function") return globalThis.awtsmoosFetch;
  if (typeof globalThis.mFetch === "function") return globalThis.mFetch;
  return null;
}

async function selectedLocalRelay() {
  if (await canUseTunnelRelay()) {
    mFetch = tunnelRelayFetch;
    announceTransport("awtsmoos-tunnel");
    return mFetch;
  }
  if (await canUseNodeRelay()) {
    mFetch = nodeRelayFetch;
    announceTransport("node-relay");
    return mFetch;
  }
  return null;
}

async function canUseTunnelRelay() {
  try { return await checkTunnelRelay(); }
  catch { return false; }
}

async function canUseNodeRelay() {
  try { return await checkNodeRelay(); }
  catch { return false; }
}

function announceTransport(label) {
  try {
    globalThis.dispatchEvent?.(new CustomEvent("awtsmoos-ai-transport", { detail: { kind: label, label } }));
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
