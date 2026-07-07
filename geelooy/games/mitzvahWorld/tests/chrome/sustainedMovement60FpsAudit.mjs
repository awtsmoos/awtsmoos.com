// B"H
/**
 * Real Chrome harness for the requested sustained movement proof. It waits for
 * stable playable, holds movement keys, gives the worker FPS payload a brief
 * movement warmup, then samples the actual Mitzvah World engine once per second
 * for 30+ seconds. Page rAF is recorded as a non-gating diagnostic.
 */
import { findBrowser } from "./ChromePath.js";
import { launchChrome } from "./ChromeLauncher.js";
import { connectCdp } from "./ChromeDevTools.js";

const repoRootUrl = process.env.MITZVAH_WORLD_URL || "http://127.0.0.1:8080/games/mitzvahWorld/";
const proofMs = Math.max(30000, Number(process.env.MITZVAH_SUSTAINED_FPS_MS || 31000));
const warmupMs = Math.max(0, Number(process.env.MITZVAH_SUSTAINED_FPS_WARMUP_MS || 2000));
const targetUrl = `${repoRootUrl}?compact=true&path=village.json&awtsAudit=sustained-fps-${Date.now()}`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function evaluate(client, expression, timeoutMs = 45000) {
  const result = await client.send("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutMs);
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime evaluation failed.");
  return result.result?.value;
}

function isContextReset(error) {
  return /Execution context was destroyed|Cannot find context|Inspected target navigated/i.test(String(error?.message || error));
}

async function evaluateAfterNavigation(client, expression, timeoutMs = 45000) {
  for (let attempt = 0; attempt < 18; attempt += 1) {
    try {
      return await evaluate(client, expression, timeoutMs);
    } catch (error) {
      if (!isContextReset(error)) throw error;
      await sleep(350);
    }
  }
  return evaluate(client, expression, timeoutMs);
}

async function waitForStablePlayable(client) {
  let stable = 0;
  let last = null;
  for (let attempt = 0; attempt < 130; attempt += 1) {
    let proof = null;
    try {
      proof = await evaluate(client, `(() => {
        const fps = window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ || null;
        const c = document.querySelector("canvas");
        const hidden = !document.getElementById("awtsmoosLoadingVeil");
        const loading = window.__MITZVAH_LOADING_DIAG__?.()?.loading || null;
        return {
          ready:Boolean(c && hidden && fps?.renderInfo?.calls > 0 && fps?.renderBudget?.total?.visibleMeshes > 0),
          href:location.href,
          title:document.title,
          canvas:Boolean(c),
          hidden,
          calls:fps?.renderInfo?.calls || 0,
          visibleMeshes:fps?.renderBudget?.total?.visibleMeshes || 0,
          fps:fps?.fps || 0,
          loading
        };
      })()`, 8000);
    } catch (error) {
      if (!isContextReset(error)) throw error;
      stable = 0;
      await sleep(350);
      continue;
    }
    last = proof;
    stable = proof.ready ? stable + 1 : 0;
    if (stable >= 4) return proof;
    await sleep(250);
  }
  return { ready:false, reason:"stable-playable-timeout", last };
}

const browser = findBrowser();
if (!browser.path) throw new Error("No Chrome/Chromium browser found for sustainedMovement60FpsAudit.");

const chrome = await launchChrome(browser.path, targetUrl, 9232, { width:1280, height:720 });
const events = [];
try {
  const client = await connectCdp(chrome.page.webSocketDebuggerUrl, event => {
    if (["Runtime.exceptionThrown", "Log.entryAdded", "Network.loadingFailed"].includes(event.method)) events.push(event);
  });
  await client.send("Runtime.enable");
  await client.send("Log.enable");
  await client.send("Network.enable");
  const readyProof = await waitForStablePlayable(client);
  if (!readyProof.ready) {
    console.error(JSON.stringify({ ok:false, reason:"not-playable", readyProof }, null, 2));
    process.exit(1);
  }
  await sleep(1000);
  const proof = await evaluateAfterNavigation(client, `(() => new Promise(resolve => {
    const warmupMs = ${warmupMs};
    const proofMs = ${proofMs};
    function key(code, type) {
      document.dispatchEvent(new KeyboardEvent(type, { bubbles:true, cancelable:true, code, key:code.replace("Key", "").toLowerCase() }));
      window.dispatchEvent(new KeyboardEvent(type, { bubbles:true, cancelable:true, code, key:code.replace("Key", "").toLowerCase() }));
    }
    function ready() {
      const fps = window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ || null;
      const c = document.querySelector("canvas");
      const hidden = !document.getElementById("awtsmoosLoadingVeil");
      return Boolean(c && hidden && fps?.renderInfo?.calls > 0 && fps?.renderBudget?.total?.visibleMeshes > 0);
    }
    const engineSamples = [];
    const pageRafSamples = [];
    const warmupEngineSamples = [];
    let rafFrames = 0;
    let rafSecondFrames = 0;
    let rafLastSecond = performance.now();
    const started = performance.now();
    key("KeyW", "keydown");
    key("KeyD", "keydown");
    const sampleEngine = () => {
      const fps = window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ || {};
      return {
        second:0,
        fps:Math.round(Number(fps.fps || 0)),
        avgFrameMs:Number(fps.avgFrameMs || 0),
        maxFrameMs:Number(fps.maxFrameMs || 0),
        renderMs:Number(fps.renderCostMs || 0),
        totalMs:Number(fps.stages?.total || 0),
        visibleMeshes:Number(fps.renderBudget?.total?.visibleMeshes || 0),
        drawCalls:Number(fps.renderBudget?.total?.drawCalls || 0),
        pixelRatio:Number(fps.pixelRatio || 0)
      };
    };
    const engineTimer = setInterval(() => {
      const elapsed = performance.now() - started;
      const row = sampleEngine();
      if (elapsed < warmupMs) {
        row.second = warmupEngineSamples.length + 1;
        warmupEngineSamples.push(row);
        return;
      }
      row.second = engineSamples.length + 1;
      engineSamples.push(row);
    }, 1000);
    const step = now => {
      rafFrames += 1;
      rafSecondFrames += 1;
      if (now - rafLastSecond >= 1000) {
        pageRafSamples.push({ second:pageRafSamples.length + 1, fps:Math.round(rafSecondFrames * 1000 / (now - rafLastSecond)), frameMs:Number(((now - rafLastSecond) / Math.max(1, rafSecondFrames)).toFixed(2)) });
        rafSecondFrames = 0;
        rafLastSecond = now;
      }
      if (now - started < warmupMs + proofMs) requestAnimationFrame(step);
      else {
        clearInterval(engineTimer);
        key("KeyW", "keyup");
        key("KeyD", "keyup");
        const engineMinFps = Math.min(...engineSamples.map(s => s.fps));
        const pageRafMinFps = Math.min(...pageRafSamples.map(s => s.fps));
        resolve({
          ready:ready(),
          durationMs:now - started,
          warmupMs,
          proofMs,
          rafFrames,
          warmupEngineSamples,
          engineSamples,
          pageRafSamples,
          engineMinFps,
          pageRafMinFps,
          everyEngineSample60:engineSamples.length >= 30 && engineSamples.every(s => s.fps >= 60),
          pageRafEverySample60:pageRafSamples.length >= 30 && pageRafSamples.every(s => s.fps >= 60),
          workerFps:window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ || null,
          href:location.href
        });
      }
    };
    requestAnimationFrame(step);
  }))()`, warmupMs + proofMs + 40000);
  const badEvents = events.filter(event => event.method === "Runtime.exceptionThrown" || event.method === "Network.loadingFailed");
  if (!proof.everyEngineSample60 || badEvents.length) {
    console.error(JSON.stringify({ ok:false, readyProof, proof, badEvents:badEvents.slice(0, 8) }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok:true, test:"sustainedMovement60FpsAudit", readyProof, proof }, null, 2));
  client.close?.();
} finally {
  await chrome.close();
}
