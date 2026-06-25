// B"H
// The device is a vessel; policy listens before demanding light.
export function createDevicePolicy() {
  let battery = 1, charging = true, memory = 4, compactAt = 0;
  async function init() {
    memory = navigator.deviceMemory || memory;
    try { const b = await navigator.getBattery?.(); if (b) { battery = b.level; charging = b.charging; b.onlevelchange = () => battery = b.level; b.onchargingchange = () => charging = b.charging; } } catch {}
  }
  function pressure() { return (battery < .22 && !charging ? 1 : 0) + (memory <= 2 ? 1 : 0); }
  function tierBias() { return Math.min(1, pressure()); }
  function shouldCompact(now) { if (now - compactAt < 5000) return false; compactAt = now; return pressure() > 0; }
  return { init, tierBias, shouldCompact, snapshot: () => ({ battery, charging, memory }) };
}
export function benchmark() {
  const a = performance.now(); let n = 0; for (let i = 0; i < 32000; i++) n += (i * 17) % 23;
  return { score: Math.max(1, Math.round(32000 / Math.max(1, performance.now() - a))), n };
}
