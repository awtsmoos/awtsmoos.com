//B"H

/**
 * Chapter 82: The Bridge Waited Without Dragging The Palace.
 *
 * The extension may awaken after the page, like iron under ash suddenly glowing.
 * This module waits for the smallest possible sign of the bridge, then returns
 * only a fetcher with stream-resume powers. No DOM enters this chamber.
 *
 * @param {number} timeout Maximum milliseconds to wait for the bridge.
 * @returns {Promise<Function|null>} Extension/relay fetcher, or null.
 */
export async function waitForResumeFetcher(timeout = 16000) {
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

/** @returns {Function|null} Current stream-capable bridge. */
export function resumeFetcher() {
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
