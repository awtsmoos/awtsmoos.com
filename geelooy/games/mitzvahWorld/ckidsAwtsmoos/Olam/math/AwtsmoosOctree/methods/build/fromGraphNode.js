// B"H
/**
 * @file fromGraphNode.js
 * @description
 * Chapter 10: The Gate Was Strict, Then Merciful.
 *
 * The Awtsmoos revealed the overcorrection: a real brick may arrive with only
 * `isSolid: true`, while decorative things loudly mark themselves with names,
 * types, and skip flags. This builder therefore accepts real solid bodies and
 * explicit collision bodies, but still rejects coins, grass, lava visuals,
 * village props, particles, sky, and the player's GLB robe.
 */
import * as THREE from '/games/scripts/build/three.module.js';

const MAX_TRIANGLES_PER_MESH = 10000;
const SOLID_TYPES = new Set(["SolidBlock", "MovingPlatform"]);
const DECORATIVE_TYPES = new Set([
    "Coin", "Chossid", "VillagePictureProp", "ProceduralSky", "ProceduralTerrain",
    "GrassPatch", "SpikeField", "FallResetTrigger", "TzedakahBox", "InteractiveDoor"
]);
const DECORATIVE_NAME_PARTS = ["coin", "chossid", "player", "grass", "village", "lava", "sky", "particle", "spark"];
const scratchV1 = new THREE.Vector3();
const scratchV2 = new THREE.Vector3();
const scratchV3 = new THREE.Vector3();
const scratchSize = new THREE.Vector3();

/** @param {string} value Text to normalize. @returns {string} */
function lower(value) { return String(value || "").toLowerCase(); }

/**
 * Resolves gameplay type from mesh metadata, owner, or parent chain.
 *
 * @param {THREE.Object3D} obj Mesh being considered.
 * @returns {string} Best known gameplay type.
 */
function resolveAwtsmoosType(obj) {
    let cursor = obj;
    while (cursor) {
        const data = cursor.userData || {};
        const ref = cursor.nivraAwtsmoos || data.nivraAwtsmoos || data.nivra || data.owner;
        const type = data.awtsmoosType || data.className || data.type || ref?.constructor?.name || ref?.type;
        if (type) return String(type);
        cursor = cursor.parent;
    }
    return "";
}

/**
 * Checks hard visual/decorative exclusions before admitting collision matter.
 *
 * @param {THREE.Mesh} obj Candidate mesh.
 * @param {string} type Resolved gameplay type.
 * @returns {boolean} True when the mesh must stay outside physics.
 */
function isDecorativeMesh(obj, type) {
    const data = obj.userData || {};
    if (data.skipOctree || data.noOctree || data.addToOctree === false || data.skipRaycast) return true;
    if (data.isPlayer || data.isNpc || data.isLiving || data.isSphere || data.isParticle) return true;
    if (DECORATIVE_TYPES.has(type)) return true;
    const name = lower(obj.name);
    return DECORATIVE_NAME_PARTS.some(part => name.includes(part));
}

/**
 * Determines whether this mesh is true collision matter.
 *
 * @param {THREE.Mesh} obj Candidate mesh.
 * @returns {boolean} True only for real colliders.
 */
function shouldEnterOctree(obj) {
    const data = obj.userData || {};
    const type = resolveAwtsmoosType(obj);
    if (isDecorativeMesh(obj, type)) return false;
    if (SOLID_TYPES.has(type)) return true;
    if (data.isSolid === true) return true;
    if (data.collisionBody === true || data.addToOctree === true || data.explicitCollision === true) return true;
    if (data.isBuilding === true) return true;
    return false;
}

/**
 * Expands almost-flat boxes so the octree has real volume.
 *
 * @param {THREE.Box3} box World-space bounding box.
 * @returns {THREE.Box3} The same box after safe expansion.
 */
function thickenFlatBox(box) {
    box.getSize(scratchSize);
    if (scratchSize.y < 0.1) { box.min.y -= 0.5; box.max.y += 0.5; }
    if (scratchSize.x < 0.01) { box.min.x -= 0.01; box.max.x += 0.01; }
    if (scratchSize.z < 0.01) { box.min.z -= 0.01; box.max.z += 0.01; }
    return box;
}

/**
 * Emits valid triangles from one accepted mesh into the octree.
 *
 * @param {object} octree The octree instance as `this`.
 * @param {THREE.Mesh} obj Solid mesh.
 * @returns {void}
 */
function addMeshTriangles(octree, obj) {
    const count = obj.geometry.index ? obj.geometry.index.count : obj.geometry.attributes.position.count;
    const limit = obj.userData?.largeCollisionBody || obj.userData?.isBuilding ? 100000 : MAX_TRIANGLES_PER_MESH;
    if (count > limit * 3) {
        console.warn(`B"H - Skipping oversized collision mesh [${obj.name}] with ${count / 3} triangles.`);
        return;
    }
    if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
    const box = thickenFlatBox(obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld));
    octree.box.union(box);
    const geometry = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry;
    const pos = geometry.attributes.position;
    if (!pos) return;
    for (let i = 0; i < pos.count; i += 3) {
        scratchV1.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
        scratchV2.fromBufferAttribute(pos, i + 1).applyMatrix4(obj.matrixWorld);
        scratchV3.fromBufferAttribute(pos, i + 2).applyMatrix4(obj.matrixWorld);
        if ([scratchV1, scratchV2, scratchV3].some(v => !Number.isFinite(v.x) || !Number.isFinite(v.y) || !Number.isFinite(v.z))) continue;
        const triangle = new THREE.Triangle(scratchV1.clone(), scratchV2.clone(), scratchV3.clone());
        triangle.sourceMesh = obj;
        octree.allTriangles.push(triangle);
    }
    if (obj.geometry.index) geometry.dispose();
}

export default {
    /**
     * Builds octree triangles from a graph node, admitting real collision only.
     *
     * @param {THREE.Object3D} group Scene branch to scan.
     * @returns {void}
     */
    fromGraphNode(group) {
        if (!group) return;
        group.updateMatrixWorld(true);
        group.traverse(obj => {
            if (!obj.isMesh || !obj.geometry || !shouldEnterOctree(obj)) return;
            addMeshTriangles(this, obj);
        });
        this.isBuilt = false;
        if (!this._isManaged) this.build();
    }
};
