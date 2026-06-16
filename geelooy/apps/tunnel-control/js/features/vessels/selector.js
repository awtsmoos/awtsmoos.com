// B"H

export const VIRTUAL_OS_TUNNEL = "awtsmoos-virtual-os";
export const TARGET_VESSEL_MEMORY = "awtTargetVesselName";

/**
 * B"H
 * Chapter: The Cup Learns Which River It Drinks From.
 *
 * Native tunnel, browser tab, and hosted Virtual OS are not rivals. They are
 * vessels. This module makes one small covenant: every action may ask, with
 * clean deterministic logic, which vessel is currently selected.
 */
export function normalizeVessel(device = {}, fallbackType = "vessel") {
  const tunnelName = device.tunnelName || device.name || device.id || "";
  if (!tunnelName) return null;
  const vesselType = device.vesselType || device.kind || fallbackType;
  return {
    ...device,
    tunnelName,
    name: tunnelName,
    vesselType,
    kind: vesselType,
    label: labelForVessel({ ...device, tunnelName, vesselType })
  };
}

export function labelForVessel(vessel = {}) {
  const name = vessel.tunnelName || vessel.name || VIRTUAL_OS_TUNNEL;
  const type = vessel.vesselType || vessel.kind || "vessel";
  if (name === VIRTUAL_OS_TUNNEL || type === "virtual-os") return `${name} — Hosted Virtual OS`;
  if (type === "browser-tab") return `${name} — Browser tab`;
  if (type === "native-tunnel") return `${name} — Native tunnel`;
  return `${name} — ${type}`;
}

function pushUnique(out, seen, item) {
  const vessel = normalizeVessel(item);
  if (!vessel || seen.has(vessel.tunnelName)) return;
  seen.add(vessel.tunnelName);
  out.push(vessel);
}

export function collectVessels(got = {}) {
  const out = [];
  const seen = new Set();
  for (const device of got.browserDevices || []) pushUnique(out, seen, { ...device, vesselType: device.vesselType || "browser-tab" });
  for (const device of got.nativeDevices || got.tunnels || []) pushUnique(out, seen, { ...device, vesselType: device.vesselType || "native-tunnel" });
  if (got.device) pushUnique(out, seen, got.device);
  if (got.tunnel) pushUnique(out, seen, got.tunnel);
  if (got.recommended) pushUnique(out, seen, got.recommended);
  pushUnique(out, seen, got.virtualDevice || { tunnelName: VIRTUAL_OS_TUNNEL, vesselType: "virtual-os", allowWrite: true });
  return out;
}

export function readStoredTarget(storage = globalThis.localStorage) {
  try { return storage?.getItem(TARGET_VESSEL_MEMORY) || ""; }
  catch { return ""; }
}

export function rememberTargetVessel(name, storage = globalThis.localStorage) {
  const value = String(name || "").trim() || VIRTUAL_OS_TUNNEL;
  try { storage?.setItem(TARGET_VESSEL_MEMORY, value); } catch {}
  return value;
}

export function chooseTargetVessel(got = {}, preferred = "") {
  const vessels = collectVessels(got);
  const wanted = String(preferred || readStoredTarget() || got.recommended?.tunnelName || got.tunnelName || "").trim();
  const match = vessels.find(vessel => vessel.tunnelName === wanted);
  if (match) return match;
  return vessels.find(vessel => vessel.tunnelName !== VIRTUAL_OS_TUNNEL) || vessels[0] || normalizeVessel({ tunnelName: VIRTUAL_OS_TUNNEL, vesselType: "virtual-os" });
}

export function currentTargetVesselName(fallback = "") {
  return String(readStoredTarget() || fallback || VIRTUAL_OS_TUNNEL).trim();
}

export function renderTargetOptions(select, got = {}, preferred = "") {
  if (!select) return chooseTargetVessel(got, preferred);
  const vessels = collectVessels(got);
  const selected = chooseTargetVessel(got, preferred);
  select.replaceChildren(...vessels.map(vessel => {
    const option = document.createElement("option");
    option.value = vessel.tunnelName;
    option.textContent = vessel.label;
    option.dataset.vesselType = vessel.vesselType || "vessel";
    return option;
  }));
  select.value = selected.tunnelName;
  rememberTargetVessel(selected.tunnelName);
  return selected;
}

export function bindTargetSelect(select, onChange = () => {}) {
  if (!select) return;
  select.addEventListener("change", () => onChange(rememberTargetVessel(select.value)));
}
