// B"H
/**
 * @module lifecycle
 * @description Chapter 956: every heescheel soul now names itself before it walks.
 * When a vessel cracks, the Awtsmoos demands name, type, constructor, size,
 * dimensions, asset weight, mesh presence, stack, and message — no more fog.
 */
import { postWorkerProgress } from "../../oyved/core/protocol/WorkerProtocol.js";

const HEESCHEEL_TIMEOUT_MS = 25_000;
const LOADING_RANGE_START = 50;
const LOADING_RANGE_END = 100;

function mark(stage, data = {}) {
  const label = data.label ? `:${String(data.label).slice(0, 80)}` : "";
  postWorkerProgress(`lifecycle:${stage}${label}`);
}

export default {
  /** @param {object[]} nivrayimMade Nivrayim to awaken. @returns {Promise<void>} */
  async runHeescheel(nivrayimMade) {
    const total = nivrayimMade.length;
    mark("heescheel:batch:start", { label: `count=${total}` });
    for (let i = 0; i < total; i += 1) {
      const nivra = nivrayimMade[i];
      const label = `${i}/${total}:${nivra.name || nivra.constructor?.name || "Unknown"}:${nivra.type || nivra.constructor?.name || "no-type"}`;
      mark("heescheel:item:start", { label });
      if (nivra.heescheel && typeof nivra.heescheel === "function") await runOneHeescheel.call(this, nivra, label, nivrayimMade);
      mark("heescheel:item:done", { label });
      this.ayshPeula("increase loading percentage", { amount: loadingPercent(i, total), reset: true, nivra, action: `Elevating: ${label}` });
    }
    mark("heescheel:batch:done", { label: `count=${total}` });
  },

  /** @param {object[]} nivrayimMade Nivrayim. @returns {Promise<void>} */
  async runMadeAll(nivrayimMade) {
    mark("madeAll:batch:start", { label: `count=${nivrayimMade.length}` });
    for (const nivra of nivrayimMade) if (nivra.madeAll) await nivra.madeAll(this);
    mark("madeAll:batch:done", { label: `count=${nivrayimMade.length}` });
  },

  /** @param {object[]} nivrayimMade Nivrayim. @returns {Promise<void>} */
  async runReady(nivrayimMade) {
    mark("ready:batch:start", { label: `count=${nivrayimMade.length}` });
    for (const nivra of nivrayimMade) if (nivra.ready) await nivra.ready();
    mark("ready:batch:done", { label: `count=${nivrayimMade.length}` });
  },

  /** @param {object[]} nivrayimMade Nivrayim. @returns {Promise<void>} */
  async runAfterBriyah(nivrayimMade) {
    mark("afterBriyah:batch:start", { label: `count=${nivrayimMade.length}` });
    for (const nivra of nivrayimMade) if (nivra.afterBriyah) await nivra.afterBriyah();
    mark("afterBriyah:batch:done", { label: `count=${nivrayimMade.length}` });
  }
};

async function runOneHeescheel(nivra, label, nivrayimMade) {
  try {
    if (this.materialGenerator && !this.materialGenerator.olam) this.materialGenerator.olam = this;
    await withTimeout(nivra.heescheel(this, { nivrayimMade }), HEESCHEEL_TIMEOUT_MS, label);
  } catch (error) {
    if (error instanceof HeescheelTimeoutError) {
      mark("heescheel:item:timeout", { label });
      return console.warn(`B"H - ⏱️ [heescheel] STALL DETECTED: ${label} took over ${HEESCHEEL_TIMEOUT_MS / 1000}s.`, describeNivra(nivra, error));
    }
    mark("heescheel:item:error", { label });
    console.error(`B"H - 🚨 [heescheel] ERROR in ${label}: ${error?.message || String(error)}`, describeNivra(nivra, error));
  }
}

function describeNivra(nivra, error) {
  return {
    name: nivra?.name,
    type: nivra?.type,
    constructor: nivra?.constructor?.name,
    size: nivra?.size,
    dimensions: nivra?.dimensions,
    assetSize: nivra?.assetSize,
    width: nivra?.width,
    height: nivra?.height,
    depth: nivra?.depth,
    hasMesh: Boolean(nivra?.mesh),
    meshName: nivra?.mesh?.name,
    meshChildren: nivra?.mesh?.children?.length,
    errorName: error?.name,
    message: error?.message || String(error),
    stack: String(error?.stack || "no stack").split("\n").slice(0, 9).join(" | ")
  };
}

function loadingPercent(index, total) {
  const bandFraction = (index + 1) / total;
  return LOADING_RANGE_START + (bandFraction * (LOADING_RANGE_END - LOADING_RANGE_START));
}

class HeescheelTimeoutError extends Error {
  constructor(label, ms) {
    super(`B"H - HeescheelTimeout: "${label}" exceeded ${ms}ms.`);
    this.name = "HeescheelTimeoutError";
  }
}

function withTimeout(promise, ms, label) {
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new HeescheelTimeoutError(label, ms)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
}
