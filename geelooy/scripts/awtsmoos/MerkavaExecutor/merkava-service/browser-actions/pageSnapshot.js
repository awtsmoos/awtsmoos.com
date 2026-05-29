// B"H
/**
 * @file pageSnapshot.js
 * @description The browser confesses its state: DOM text, canvas count, worker
 * marks, globals, errors, and requested values. Undefined stays null, because
 * the Awtsmoos never mistakes absence for an accusation.
 */
import { evaluatePage } from "./cdpClient.js";

/** @param {object} cdp CDP client. @param {Array} requestedValues Paths. @returns {Promise<object>} */
export async function collectPageSnapshot(cdp, requestedValues = []) {
  const expression = `(() => {
    const readPath = (root, path) => String(path).split('.').reduce((v, p) => v == null ? undefined : v[p], root);
    const clone = value => {
      if (value === undefined) return null;
      if (value === null) return null;
      try { return JSON.parse(JSON.stringify(value)); } catch (_) { return String(value); }
    };
    const requested = ${JSON.stringify(requestedValues || [])};
    const values = {};
    for (const key of requested) values[key] = clone(readPath(globalThis, key) ?? readPath({ window: globalThis }, key));
    return {
      url: location.href,
      title: document.title,
      readyState: document.readyState,
      scripts: [...document.scripts].map(s => s.src || s.textContent.slice(0, 120)),
      stylesheets: [...document.styleSheets].map(s => s.href || 'inline').slice(0, 50),
      bodyText: (document.body?.innerText || '').slice(0, 4000),
      htmlLength: document.documentElement?.outerHTML?.length || 0,
      canvases: [...document.querySelectorAll('canvas')].map(c => ({ width: c.width, height: c.height, clientWidth: c.clientWidth, clientHeight: c.clientHeight })),
      forms: [...document.forms].map(f => ({ id: f.id, name: f.name, elements: f.elements.length })),
      links: [...document.links].slice(0, 80).map(a => ({ text: a.innerText, href: a.href })),
      globals: Object.keys(globalThis).filter(k => /awts|olam|ikar|mitz|merk|worker|boot/i.test(k)).slice(0, 160),
      awtsmoos: {
        bootStarted: clone(globalThis.__AWTSMOOS_BOOT_STARTED__),
        bootLoaded: clone(globalThis.__AWTSMOOS_BOOT_LOADED__),
        ikarPhases: clone(globalThis.__AWTSMOOS_IKAR_PHASES__),
        workerProgress: clone(globalThis.__AWTSMOOS_WORKER_PROGRESS__),
        lastError: clone(globalThis.__AWTSMOOS_LAST_ERROR__),
        lastErrorJson: globalThis.__AWTSMOOS_LAST_ERROR_JSON__ || null,
        result: clone(globalThis.__awtsmoosResult)
      },
      values
    };
  })()`;
  return evaluatePage(cdp, expression);
}

/** @param {Array} events CDP events. @returns {object} */
export function summarizeCdpEvents(events = []) {
  const consoleEvents = events.filter(e => e.method === "Runtime.consoleAPICalled");
  const exceptions = events.filter(e => e.method === "Runtime.exceptionThrown");
  const requests = events.filter(e => e.method === "Network.requestWillBeSent");
  const failures = events.filter(e => e.method === "Network.loadingFailed");
  const responses = events.filter(e => e.method === "Network.responseReceived");
  return {
    console: consoleEvents.slice(-120).map(e => ({ type: e.params?.type, args: (e.params?.args || []).map(arg => arg.value ?? arg.description).slice(0, 6) })),
    exceptions: exceptions.slice(-20).map(e => ({ text: e.params?.exceptionDetails?.text, url: e.params?.exceptionDetails?.url, line: e.params?.exceptionDetails?.lineNumber })),
    network: {
      requestCount: requests.length,
      responseCount: responses.length,
      failureCount: failures.length,
      failures: failures.slice(-20).map(e => ({ errorText: e.params?.errorText, blockedReason: e.params?.blockedReason, requestId: e.params?.requestId }))
    },
    renderProof: consoleEvents.some(e => JSON.stringify(e.params || {}).includes("first_render_confirmed")),
    workerProof: consoleEvents.some(e => JSON.stringify(e.params || {}).includes("WORKER_PROGRESS"))
  };
}
