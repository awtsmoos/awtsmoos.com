// B"H
/**
 * @module lifecycle
 * @description Chapter 82: the heescheel chamber now tells the whole truth.
 * When a vessel cracks, the Awtsmoos demands name, type, constructor, size,
 * dimensions, asset weight, mesh presence, stack, and message — no more fog.
 */
const HEESCHEEL_TIMEOUT_MS = 25_000;
const LOADING_RANGE_START = 50;
const LOADING_RANGE_END = 100;

export default {
  /** @param {object[]} nivrayimMade Nivrayim to awaken. @returns {Promise<void>} */
  async runHeescheel(nivrayimMade) {
    const total = nivrayimMade.length;
    for (let i = 0; i < total; i += 1) {
      const nivra = nivrayimMade[i];
      const label = `${nivra.name || nivra.constructor?.name || "Unknown"}`;
      if (nivra.heescheel && typeof nivra.heescheel === "function") await runOneHeescheel.call(this, nivra, label, nivrayimMade);
      this.ayshPeula("increase loading percentage", { amount: loadingPercent(i, total), reset: true, nivra, action: `Elevating: ${label}` });
    }
  },

  /** @param {object[]} nivrayimMade Nivrayim. @returns {Promise<void>} */
  async runMadeAll(nivrayimMade) {
    for (const nivra of nivrayimMade) if (nivra.madeAll) await nivra.madeAll(this);
  },

  /** @param {object[]} nivrayimMade Nivrayim. @returns {Promise<void>} */
  async runReady(nivrayimMade) {
    for (const nivra of nivrayimMade) if (nivra.ready) await nivra.ready();
  },

  /** @param {object[]} nivrayimMade Nivrayim. @returns {Promise<void>} */
  async runAfterBriyah(nivrayimMade) {
    for (const nivra of nivrayimMade) if (nivra.afterBriyah) await nivra.afterBriyah();
  }
};

async function runOneHeescheel(nivra, label, nivrayimMade) {
  try {
    if (this.materialGenerator && !this.materialGenerator.olam) this.materialGenerator.olam = this;
    await withTimeout(nivra.heescheel(this, { nivrayimMade }), HEESCHEEL_TIMEOUT_MS, label);
  } catch (error) {
    if (error instanceof HeescheelTimeoutError) return console.warn(`B"H - ⏱️ [heescheel] STALL DETECTED: ${label} took over ${HEESCHEEL_TIMEOUT_MS / 1000}s.`, describeNivra(nivra, error));
    console.error(`B"H - 🚨 [heescheel] ERROR in ${label}: ${error?.message || String(error)}`, describeNivra(nivra, error));
  }
}

function describeNivra(nivra, error) {
  return { name: nivra?.name, type: nivra?.type, constructor: nivra?.constructor?.name, size: nivra?.size, dimensions: nivra?.dimensions, assetSize: nivra?.assetSize, width: nivra?.width, height: nivra?.height, depth: nivra?.depth, hasMesh: Boolean(nivra?.mesh), meshName: nivra?.mesh?.name, meshChildren: nivra?.mesh?.children?.length, errorName: error?.name, message: error?.message || String(error), stack: String(error?.stack || "no stack").split("\n").slice(0, 9).join(" | ") };
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
  const timeoutPromise = new Promise((_, reject) => { timeoutHandle = setTimeout(() => reject(new HeescheelTimeoutError(label, ms)), ms); });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
}
