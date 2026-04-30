
/**
 * B"H
 * @module ProceduralTerrain
 * @description
 * 🌿 THE GROUND OF REVELATION 🌿
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from '/games/scripts/build/three.module.js';
import TerrainSculptor from "../../utils/3d/TerrainSculptor.js";

export default class ProceduralTerrain extends Domem {
    type = "proceduralTerrain";

    constructor(op, olam) {
        super(op, olam);
        this.width = op.width || 1000;
        this.depth = op.depth || 1000;
        this.segments = op.segments || 20;
        this.hills = op.hills || [];
        this.textureType = op.textureType || "safegrass";
    }

    async heescheel(olam) {
        this.olam = olam;
        console.log(`B"H - 🌿 [Terrain]: Commencing manifestation of [${this.name}]`);

        // 1. FORGE GEOMETRY
        const geometry = new THREE.PlaneGeometry(this.width, this.depth, this.segments, this.segments);
        geometry.rotateX(-Math.PI / 2); // Lay flat

        if (this.hills.length > 0) {
            TerrainSculptor.sculpt(geometry, this.hills);
        }

        // 2. WEAVE MATERIAL
        let material;
        try {
            const texUrl = `awtsmoosTex://${this.textureType}`;
            const map = await this.olam.loadTexture({ 
                url: texUrl, 
                shouldRepeat: true, 
                repeatX: this.width / 10, 
                repeatY: this.depth / 10 
            });

            material = new THREE.MeshStandardMaterial({
                map: map,
                roughness: 1.0,
                metalness: 0.0,
                color: 0xffffff,
                side: THREE.DoubleSide // Visible from both worlds
            });
        } catch(e) {
            console.warn("B\"H - [Terrain]: Texture Forge failed. Using fallback emerald pigment.");
            material = new THREE.MeshLambertMaterial({ color: 0x228B22, side: THREE.DoubleSide });
        }

        // 3. ASSEMBLE MESH
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = this.name;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.visible = true;
        this.mesh.frustumCulled = false; // B"H: ABSOLUTELY ESSENTIAL! Never hide the ground.

        if (this.position) {
            this.mesh.position.copy(this.position.vector3());
        }

        // 4. SOLIDIFY
        this.mesh.updateMatrix();
        this.mesh.updateMatrixWorld(true);
        this.mesh.userData.isSolid = true;
        this.mesh.userData.isTerrain = true;

        await olam.hoyseef(this);
        
        if(this.olam.worldOctree) {
            console.log(`B"H - ⚓ [Terrain]: Sending [${this.name}] to the Octree.`);
            this.olam.worldOctree.addObject(this.mesh);
        }

        console.log(`B"H - ✅ [Terrain]: [${this.name}] stands in existence at Y: ${this.mesh.position.y}`);
        this.isReady = true;
    }
}
