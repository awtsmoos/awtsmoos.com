// B"H
/** @file ThreeHeldMeshBuilder.js @description Turns held mesh recipes into THREE groups when THREE is present. */
function fallbackObject(name, descriptor) { return { name, descriptor, children:[], position:{}, rotation:{}, scale:{}, visible:true, add(child){ this.children.push(child); child.parent = this; } }; }
function makeMaterial(THREE, name = "held") { const color = name.includes("gold") ? 0xffcc55 : name.includes("silver") ? 0xdde7ff : name.includes("wood") ? 0x775533 : 0x88ccff; return THREE?.MeshStandardMaterial ? new THREE.MeshStandardMaterial({ name, color }) : { name, color }; }
function makeGeometry(THREE, part) { const d=part.dims||{}; if(part.kind==="sphere" && THREE?.SphereGeometry) return new THREE.SphereGeometry(d.r||.05,16,12); if(part.kind==="cylinder" && THREE?.CylinderGeometry) return new THREE.CylinderGeometry(d.r||.03,d.r||.03,d.h||1,12); if(THREE?.BoxGeometry) return new THREE.BoxGeometry(d.x||.05,d.y||.2,d.z||.05); return { kind:part.kind, dims:d }; }
export function buildThreeHeldMesh(descriptor, THREE = globalThis.THREE) {
  if (!THREE?.Group || !THREE?.Mesh) return fallbackObject(descriptor?.id || "heldMesh", descriptor);
  const group = new THREE.Group(); group.name = descriptor.id || `held_${descriptor.itemId}`; group.userData = { descriptor, awtsmoosHeldMesh:true };
  for (const part of descriptor.recipe?.parts || []) { const mesh = new THREE.Mesh(makeGeometry(THREE, part), makeMaterial(THREE, part.material)); mesh.name = `${descriptor.itemId}_${part.kind}`; group.add(mesh); }
  return group;
}
export default buildThreeHeldMesh;
