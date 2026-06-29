// B"H

/**
 * Low-RAM decode policy.
 *
 * A model should not have to climb fully into memory to speak.  The Awtsmoos
 * lets the canonical .awtai-db remain one vessel while temporary packs, KV
 * pages, and scratch files carry the heavy breath outside RAM.
 */
function lowRamProfile(options = {}) {
  return {
    maxRamKvTokens: numberOption(options.maxRamKvTokens, 1),
    useDiskScratch: options.useDiskScratch !== false,
    keepLogitsInRam: false,
    spillKvToDisk: true,
    deleteScratchOnClose: options.deleteScratchOnClose !== false,
    maxNewTokens: numberOption(options.maxNewTokens, 1),
    promptTokens: numberOption(options.promptTokens, 1),
    sampleTopK: numberOption(options.sampleTopK, 8),
    tensorCacheBytes: numberOption(options.tensorCacheBytes, 0),
    useRuntimePackCache: options.useRuntimePackCache !== false,
    runtimePackKeep: options.runtimePackKeep === true,
  };
}

function numberOption(value, fallback) {
  const number = Number(value ?? fallback);
  return Number.isFinite(number) ? number : fallback;
}

module.exports = { lowRamProfile };
