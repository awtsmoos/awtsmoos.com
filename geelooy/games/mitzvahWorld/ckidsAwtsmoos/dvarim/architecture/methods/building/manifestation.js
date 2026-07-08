// B"H
/**
 * @file manifestation.js
 * @description
 * Chapter 341: The house stops confusing beauty with collision.
 *
 * The Awtsmoos gives the building two bodies: a visible brick-and-roof body for
 * the eye, and a hidden clean collider body for feet. Doorways are carved in the
 * collider, so an opened door becomes a real passage.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import HouseAssembler from '../../../../utils/3d/procedural/house/HouseAssembler.js?compact=true&v=brick-visual-clean-collider-20260603-bh341';
import SubEntitySpawner from '../SubEntitySpawner.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const hiddenColliderMat = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });

function copyTransform(target, source) {
  target.position.copy(source.position);
  target.rotation.copy(source.rotation);
  target.scale.copy(source.scale);
  target.updateWorldMatrix(true, true);
}
function markCollider(mesh, visual, building) {
  mesh.name = `${visual.name}_clean_carved_collider`;
  mesh.nivraAwtsmoos = building;
  Object.assign(mesh.userData ||= {}, {
    isSolid: true,
    isBuilding: true,
    explicitCollision: true,
    visualReference: visual,
    colliderRole: 'clean-carved-building-shell'
  });
}

export default {
  /** @method manifest @description Core manifestation pipeline. */
  async manifest(building) {
    const blueprint = building.blueprint;
    const olam = building.olam;
    try {
      const visualGeo = HouseAssembler.generateFromBlueprint(blueprint);
      const materials = await this.loadBuildingMaterials(olam);
      const mesh = new THREE.Mesh(visualGeo, materials);
      mesh.name = building.name || 'Building';
      building.mesh = mesh;
      mesh.nivraAwtsmoos = building;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const p = building.position?.vector3 ? building.position.vector3() : building.position;
      if (p) mesh.position.set(p.x || 0, p.y || 0, p.z || 0);
      const r = building.rotation;
      if (r) mesh.rotation.set(r.x || 0, r.y || 0, r.z || 0);
      olam.nivrayimGroup.add(mesh);
      mesh.updateWorldMatrix(true, true);
      Object.assign(mesh.userData ||= {}, { isBuilding: true, skipOctree: true, noOctree: true, visualOnlyBuilding: true });
      this._groundBuilding(olam, mesh, blueprint);
      mesh.updateWorldMatrix(true, false);

      const colliderGeo = HouseAssembler.generateColliderFromBlueprint(blueprint);
      const collider = new THREE.Mesh(colliderGeo, hiddenColliderMat.clone());
      building.colliderMesh = collider;
      copyTransform(collider, mesh);
      markCollider(collider, mesh, building);
      const added = olam.worldOctree?.addObject?.(collider) || false;
      console.info('B"H | BUILDING_CLEAN_COLLIDER_INSERT', { name: mesh.name, added });
      olam.worldOctree?._processQueues?.(true);

      await SubEntitySpawner.spawnEntrances(building, blueprint);
      building.isReady = true;
    } catch (err) {
      console.error('B"H - Building failed:', building.name, err?.message || err);
    }
  }
};
