//B"H

import { AwtsmoosPrompt } from "../../../prompt.js";

let mFetch = globalThis.awtsmoosFetch || null;
let waiting = null;

/**
 * B"H — Reveals the Awtsmoos extension fetch bridge as the old file did, but
 * with patience. The content script can arrive shortly after the app shell, so
 * we wait for `window.awtsmoosFetch` and `server-ready` before showing the
 * custom extension instructions.
 *
 * @returns {Promise<Function|null>} The living fetch bridge, or null if unavailable.
 */
export async function checkMFetch({ quiet = false, timeout = 3500 } = {}) {
  if (!mFetch) mFetch = globalThis.awtsmoosFetch;
  if (mFetch) return mFetch;

  mFetch = await waitForBridge(timeout);
  if (mFetch) return mFetch;

  if (!quiet) {
    await AwtsmoosPrompt.go({
      isAlert: true,
      headerTxt: `
        <p>The Awtsmoos Chrome Server Extension bridge is not visible on this page yet.</p>
        <p>Make sure the unpacked extension is loaded from <code>geelooy/scripts/tricks/extensions/server</code>, click <strong>Reload</strong> on <code>chrome://extensions</code>, then refresh this tab.</p>
      `
    });
  }
  return null;
}

export function getMFetch() {
  return mFetch || globalThis.awtsmoosFetch || null;
}

export function setMFetch(fetcher) {
  mFetch = fetcher;
  return mFetch;
}

function waitForBridge(timeout = 3500) {
  if (globalThis.awtsmoosFetch) return Promise.resolve(globalThis.awtsmoosFetch);
  if (waiting) return waiting;

  waiting = new Promise(resolve => {
    const started = Date.now();
    const done = fetcher => {
      cleanup();
      mFetch = fetcher || globalThis.awtsmoosFetch || null;
      waiting = null;
      resolve(mFetch);
    };
    const tick = () => {
      if (globalThis.awtsmoosFetch) return done(globalThis.awtsmoosFetch);
      if (Date.now() - started >= timeout) return done(null);
      timer = setTimeout(tick, 100);
    };
    const onMessage = event => {
      if (event?.data?.from === "awtsmoos-content" && event.data.type === "server-ready") {
        setTimeout(() => done(globalThis.awtsmoosFetch || null), 50);
      }
    };
    const cleanup = () => {
      clearTimeout(timer);
      globalThis.removeEventListener?.("message", onMessage);
    };
    let timer = setTimeout(tick, 0);
    globalThis.addEventListener?.("message", onMessage);
  });

  return waiting;
}
