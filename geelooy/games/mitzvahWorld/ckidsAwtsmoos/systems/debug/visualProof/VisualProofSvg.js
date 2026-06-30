// B"H
const color = { house:"#1f6f8b", wall:"#455a64", door:"#8d6e63", trigger:"#f9a825", hazard:"#c62828" };

function rect(body, scale, ox, oy) {
  const b = body.bounds, fill = color[body.kind] || (body.trigger ? "#8e24aa" : "#607d8b");
  const w = (b.maxX - b.minX) * scale, h = (b.maxZ - b.minZ) * scale;
  const x = ox + b.minX * scale, y = oy + b.minZ * scale;
  const dash = body.trigger ? " stroke-dasharray='4 3'" : "";
  return `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${fill}' fill-opacity='.32' stroke='${fill}'${dash}/>`;
}

function dot(entity, scale, ox, oy, fill) {
  const p = entity.mesh?.position || entity.position || entity;
  const x = ox + Number(p.x || 0) * scale, y = oy + Number(p.z ?? p.y ?? 0) * scale;
  return `<circle cx='${x}' cy='${y}' r='5' fill='${fill}'/><text x='${x + 6}' y='${y - 6}' font-size='10'>${entity.id || ""}</text>`;
}

export function renderVisualProofSvg(state = {}) {
  const scale = state.scale || 8, ox = state.offsetX || 40, oy = state.offsetY || 40;
  const bodies = [...(state.bodies || [])].map(body => rect(body, scale, ox, oy)).join("\n");
  const entities = [
    dot(state.player || { id:"player", x:0, z:0 }, scale, ox, oy, "#00c853"),
    ...(state.animals || []).map(e => dot(e, scale, ox, oy, "#ffab00")),
    ...(state.npcs || []).map(e => dot(e, scale, ox, oy, "#2979ff")),
    ...(state.hostiles || []).map(e => dot(e, scale, ox, oy, "#d50000"))
  ].join("\n");
  const title = state.title || "visual proof";
  return `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='520' viewBox='0 0 900 520'>
<rect width='900' height='520' fill='#f7fbf8'/>
<text x='20' y='24' font-size='18' font-family='Arial'>${title}</text>
${bodies}
${entities}
</svg>
`;
}

export default { renderVisualProofSvg };
