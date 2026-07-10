// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from './Box3D.js';

/** SunShadowProjector: cheap projected shadows, no shadow maps, no extra render pass. */
export class SunShadowProjector {
  constructor(scene) {
    this.group = new Group(); this.group.name = 'Awtsmoos_fast_sun_projected_shadows';
    this.player = shadowDisc('player-sun-shadow', 1.05, .22);
    this.npc = shadowDisc('npc-sun-shadow', .95, .18);
    this.house = shadowBox('house-roof-ground-shadow', 10.8, 6.8, .16);
    this.group.add(this.player); this.group.add(this.npc); this.group.add(this.house); scene.add(this.group);
  }
  update({ state, ground, npc, worldMode }) {
    const lava = state.level.startsWith('lava'); this.group.visible = true;
    place(this.player, state.x - .55, ground.heightAt(state.x, state.z) + .025, state.z + .45, state.facing);
    this.npc.visible = !lava && npc?.group?.visible !== false; if (this.npc.visible) place(this.npc, npc.x - .45, ground.heightAt(npc.x, npc.z) + .026, npc.z + .35, 0);
    this.house.visible = !lava && worldMode?.mode === 'eretz'; if (this.house.visible) place(this.house, 16.8, ground.heightAt(16.8, -19.2) + .028, -18.7, -.16);
  }
  stats() { return { player: this.player.visible, npc: this.npc.visible, house: this.house.visible, method: 'flat projected transparent meshes along sun direction' }; }
}
function shadowDisc(id, radius, opacity) { const m = createPrimitiveMesh({ id, shape: 'cylinder', color: '#000000', solid: false, position: { x: 0, y: 0, z: 0 }, radius, height: .025, segments: 40, rotation: {} }); return shadowMaterial(m, opacity); }
function shadowBox(id, x, z, opacity) { const m = createPrimitiveMesh({ id, shape: 'box', color: '#000000', solid: false, position: { x: 0, y: 0, z: 0 }, size: { x, y: .025, z }, rotation: { y: -.16 } }); return shadowMaterial(m, opacity); }
function shadowMaterial(m, opacity) { m.material.opacity = opacity; m.material.alphaMode = 'BLEND'; m.material.transparent = true; m.material.color = [0, 0, 0, opacity]; return m; }
function place(mesh, x, y, z, yaw) { mesh.position.set(x, y, z); mesh.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)); mesh.setBaseTransform(); }
