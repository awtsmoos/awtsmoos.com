// B"H
/** @file ThreeHeldMeshBuilder.js @description Builds held weapon meshes with separate material profiles per part. */
function node(name, descriptor) {
  return { name, descriptor, children: [], position:{x:0,y:0,z:0}, rotation:{x:0,y:0,z:0}, scale:{x:1,y:1,z:1}, visible:true, userData:{}, add(child){ this.children.push(child); child.parent=this; } };
}
function applyTransform(obj, part) { Object.assign(obj.position, part.pos || {}); Object.assign(obj.rotation, part.rot || {}); Object.assign(obj.scale, part.scale || {}); }
function fallbackPart(itemId, part) {
  const o = node(`${itemId}_${part.kind}_${part.material}`, { part });
  applyTransform(o, part);
  o.geometry = { kind:part.kind, dims:part.dims || {} };
  o.material = { name:part.material, ...(part.materialProfile || {}), textureHint:part.textureHint, normalHint:part.normalHint };
  o.userData = { part, materialProfile:part.materialProfile, materialGroup:part.materialGroup, textureHint:part.textureHint, normalHint:part.normalHint };
  return o;
}
function material(THREE, part) {
  const p = part.materialProfile || { id:part.material, color:0xffffff, metalness:0, roughness:.6 };
  return new THREE.MeshStandardMaterial({ name:p.id, color:p.color, metalness:p.metalness, roughness:p.roughness, emissive:p.emissive || 0x000000, emissiveIntensity:p.emissiveIntensity || 0 });
}
function geometry(THREE, part) {
  const d = part.dims || {};
  if (part.kind === "sphere") return new THREE.SphereGeometry(d.r || .05, 16, 12);
  if (part.kind === "cylinder") return new THREE.CylinderGeometry(d.r || .03, d.r || .03, d.h || 1, 16);
  if (part.kind === "cone") return new THREE.ConeGeometry(d.r || .05, d.h || .15, 16);
  if (part.kind === "line") return new THREE.BoxGeometry(d.w || .012, d.h || .45, .01);
  if (part.kind === "arc") return new THREE.TorusGeometry((d.w || .6) / 2, d.thick || .02, 8, 24, Math.PI);
  if (part.kind === "wedge") return new THREE.BoxGeometry(d.x || .2, d.y || .2, d.z || .04);
  if (["text","trail","flame","ring","spiral","cloth"].includes(part.kind)) return new THREE.BoxGeometry(d.x || .08, d.y || .08, d.z || .012);
  return new THREE.BoxGeometry(d.x || .05, d.y || .2, d.z || .05);
}
export function buildThreeHeldMesh(descriptor, THREE = globalThis.THREE) {
  if (!THREE?.Group || !THREE?.Mesh) {
    const group = node(descriptor?.id || "heldMesh", descriptor);
    group.userData = { descriptor, awtsmoosHeldMesh:true, fallback:true, materialGroups:descriptor?.materialGroups || [] };
    for (const part of descriptor?.recipe?.parts || []) group.add(fallbackPart(descriptor.itemId, part));
    return group;
  }
  const group = new THREE.Group();
  group.name = descriptor.id || `held_${descriptor.itemId}`;
  group.userData = { descriptor, awtsmoosHeldMesh:true, materialGroups:descriptor.materialGroups || [] };
  for (const part of descriptor.recipe?.parts || []) {
    const mesh = new THREE.Mesh(geometry(THREE, part), material(THREE, part));
    mesh.name = `${descriptor.itemId}_${part.kind}_${part.material}`;
    mesh.userData = { part, materialProfile:part.materialProfile, materialGroup:part.materialGroup, textureHint:part.textureHint, normalHint:part.normalHint };
    applyTransform(mesh, part);
    group.add(mesh);
  }
  return group;
}
export function heldMeshMaterialReport(mesh) {
  return { name:mesh.name, groups:[...new Set((mesh.children || []).map(c => c.userData?.materialGroup || c.material?.group).filter(Boolean))], materials:(mesh.children || []).map(c => ({ name:c.name, material:c.material?.name, group:c.userData?.materialGroup, textureHint:c.userData?.textureHint, metalness:c.material?.metalness, roughness:c.material?.roughness, emissive:c.material?.emissive || c.userData?.materialProfile?.emissive })) };
}
export default buildThreeHeldMesh;
