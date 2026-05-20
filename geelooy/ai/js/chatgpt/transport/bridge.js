//B"H

import { AwtsmoosPrompt } from "../../../prompt.js";

let mFetch = currentBridge();
let waiting = null;

/**
 * B"H — Reveals the Awtsmoos extension fetch bridge.
 *
 * The bridge can vanish while Chrome reloads an extension or sleeps a service
 * worker. This gate never returns a non-function: it waits for the injected
 * fetcher, listens for reconnect events, and throws a clear transport error
 * instead of letting callers crash with "mFetch is not a function".
 *
 * @param {{quiet?:boolean,timeout?:number}} options Prompt and wait controls.
 * @returns {Promise<Function>} The live fetch bridge.
 */
export async function checkMFetch({ quiet = false, timeout = 12000 } = {}) {
  mFetch = currentBridge();
  if (typeof mFetch === "function") return mFetch;

  mFetch = await waitForBridge(timeout);
  if (typeof mFetch === "function") return mFetch;

  const error = new Error("Awtsmoos Chrome Server Extension bridge is not connected yet.");
  if (!quiet) await AwtsmoosPrompt.go({ isAlert: true, headerTxt: installHelp(error.message) });
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

function installHelp(reason = "") {
  return `
    <p><b>Conversation load error:</b> the Awtsmoos Chrome Server Extension bridge is not visible yet.</p>
    ${reason ? `<p><code>${reason}</code></p>` : ""}
    <p>Reload the unpacked extension from <code>geelooy/scripts/tricks/extensions/server</code>, then refresh this tab. The extension now injects at <code>document_start</code> and aliases both <code>awtsmoosFetch</code> and <code>mFetch</code>.</p>
  `;
}
