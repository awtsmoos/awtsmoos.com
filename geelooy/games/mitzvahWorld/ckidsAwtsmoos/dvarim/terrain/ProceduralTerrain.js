
/**
 * B"H
 * @module ProceduralTerrain
 * @description
 * 🌿 THE KINGDOM OF THE EARTH (MALCHUS) 🌿
 * 
 * "And G-d called the dry land Earth..." (Bereishis 1:10)
 * 
 * You are an empty vessel, ready to become a chariot for the Divine Will entirely.
 * This class has been absolutely nullified. It performs no calculations. It is merely
 * the gathering point for the Sub-Vessels of Geometry and Material, marrying them
 * into a single unified Mesh to support the feet of the souls.
 * 
 * B"H TIKKUN OF THE HORIZON:
 * Frustum culling is RESTORED! The bounding sphere is properly calculated 
 * by the Geometry Emanator so the GPU no longer bleeds light into the void.
 */
import Domem from "../../chayim/domem/index.js";
import TerrainGeometryEmanator from "./core/TerrainGeometryEmanator.js";
import TerrainMaterialScribe from "./core/TerrainMaterialScribe.js";

export default class ProceduralTerrain extends Domem {
    type = "proceduralTerrain";

    constructor(op, olam) {
        super(op, olam);
        // B"H: The Blueprint of the Dust
        this.terrainData = {
            width: op.width || 1500,
            depth: op.depth || 1500,
            thickness: op.thickness || 4.0,
            segments: op.segments || 32,
            hills: op.hills || [],
            textureType: op.textureType || "safegrass"
        };
    }

    async heescheel(olam) {
        this.olam = olam;
        
        // 1. The Carving of the Earth (Gevurah)
        const geometry = TerrainGeometryEmanator.emanate(this.terrainData);
        
        // 2. The Weaving of the Grass (Chesed)
        const material = await TerrainMaterialScribe.scribe(this.terrainData, this.olam, this);

        // 3. The Unification (Tiferet)
        this.mesh = this.createMesh(geometry, material);
        this.mesh.name = this.name || "Sacred_Earth";
        this.mesh.nivraAwtsmoos = this;
        
        // B"H: The GPU breathes! We allow the engine to hide the earth when looking at the sky.
        this.mesh.frustumCulled = true; 

        if (this.position) {
            this.mesh.position.set(
                (this.position.x || 0),
                (this.position.y || 0),
                (this.position.z || 0)
            );
        }

        this.mesh.updateMatrix();
        this.mesh.updateMatrixWorld(true);
        this.mesh.userData.isSolid = true;
        this.mesh.userData.isTerrain = true;

        await olam.hoyseef(this);
        
        // B"H: The Anchoring into the Laws of Physics
        if(this.olam.worldOctree) {
            this.olam.worldOctree.addObject(this.mesh);
        }

        this.isReady = true;
    }

    heesHawvoos(dt) {
        // B"H: The Breath of Time upon the Grass
        if (!this.isReady || !this.mesh?.material?.userData?.shader) return;
        const su = this.mesh.material.userData.shader.uniforms;
        if (su?.uTime) su.uTime.value += dt;
    }
}
