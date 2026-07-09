// B"H
/** BattleDecor.js — banners and warning lights for battle layer proof. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function material(color) { return new THREE.MeshLambertMaterial({ color, emissive:color, emissiveIntensity:.05 }); }
function markDecor(root) { Object.assign(root.userData ||= {}, { skipOctree:true, noOctree:true, villageCombatDecor:true, villageDecor:true }); }
export function addDecor(scene, def) {
  const root = new THREE.Group(); root.name = def.name; root.position.set(def.position.x, def.position.y, def.position.z); markDecor(root);
  const pole = new THREE.Mesh(new THREE.BoxGeometry(.12, 2.4, .12), material(0x5a3a21)); pole.position.y = .55;
  const banner = new THREE.Mesh(new THREE.BoxGeometry(1.25, .82, .06), material(def.color)); banner.position.set(.48, 1.25, 0);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(.25, 12, 8), material(0xffe08a)); glow.position.set(0, 1.85, 0);
  root.add(pole, banner, glow); root.traverse(child => { child.castShadow = false; child.receiveShadow = true; markDecor(child); }); scene.add(root); return root;
}
