// B"H
/** Discovery makes distance meaningful: names appear, reward whispers. */
export const DISCOVERY_ZONES = [
  { name: "Village of First Steps", pos: [0,0,0], radius: 10, xp: 5 },
  { name: "Kindling Forest", pos: [28,0,-18], radius: 12, xp: 15 },
  { name: "Ribbon River", pos: [-34,0,-8], radius: 12, xp: 15 },
  { name: "Roadwatch Outpost", pos: [0,0,-32], radius: 10, xp: 20 }
];

export function updateVehicleDiscovery(state) {
  const p = state.activeVehicle?.mesh?.position || state.player?.position || state.camera?.position;
  if (!p) return;
  state.discovered ||= new Set();
  for (const z of DISCOVERY_ZONES) {
    const d = Math.hypot(p.x-z.pos[0], p.z-z.pos[2]);
    if (d < z.radius && !state.discovered.has(z.name)) {
      state.discovered.add(z.name);
      showDiscovery(z);
    }
  }
}

function showDiscovery(z) {
  const el = document.createElement("div");
  el.textContent = `Discovered: ${z.name}  +${z.xp} XP`;
  el.style.cssText = "position:fixed;top:34%;left:50%;transform:translateX(-50%);z-index:9300;color:#ffd966;background:rgba(4,7,14,.88);border:1px solid #ffd966;border-radius:12px;padding:14px 20px;font:800 20px system-ui";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
