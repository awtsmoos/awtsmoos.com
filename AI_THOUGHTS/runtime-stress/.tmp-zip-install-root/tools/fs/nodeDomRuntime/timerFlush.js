// B"H
/**
 * B"H
 * Gives Node timers and promises room to finish before snapshot. This is not a
 * fake event loop; it is a disciplined wait gate around the existing Merkava
 * timer vessels.
 */
async function flushRuntime(waitMs = 0) {
  await Promise.resolve();
  const ms = Math.max(0, Number(waitMs || 0));
  if (ms) await new Promise(resolve => setTimeout(resolve, ms));
  await Promise.resolve();
  await new Promise(resolve => setTimeout(resolve, 0));
  await Promise.resolve();
}

module.exports = { flushRuntime };
