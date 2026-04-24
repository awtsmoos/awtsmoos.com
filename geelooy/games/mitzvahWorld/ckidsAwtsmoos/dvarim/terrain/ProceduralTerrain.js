
/**
 * B"H
 * @module ProceduralTerrain
 * @description
 * An infinite expanse generated purely from code. It utilizes the TerrainSculptor 
 * to raise mountains and valleys. It is the "Aretz" (Earth), longing to be elevated.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from '/games/scripts/build/three.module.js';
import TerrainSculptor from "../../utils/3d/TerrainSculptor.js";

export default class ProceduralTerrain extends Domem {
    type = "proceduralTerrain";
    static itemName = "World Seed";
    static description = "Generates a vast tract of sculpted land.";
    static isBuildable = true;

    constructor(op, olam) {
        super(op, olam);
        this.width = op.width || 500;
        this.depth = op.depth || 500;
        this.segments = op.segments || 100;
        this.hills = op.hills || [];
        this.textureType = op.textureType || "sand"; // 'sand', 'grass', etc.
    }

    async heescheel(olam) {
        this.olam = olam;

        // 1. Generate the raw, flat plane (subdivided for sculpting)
        const geometry = new THREE.PlaneGeometry(this.width, this.depth, this.segments, this.segments);
        
        // B"H: Rotate to lay flat on the XZ plane
        geometry.rotateX(-Math.PI / 2);

        // 2. Sculpt the mountains and valleys
        if (this.hills.length > 0) {
            TerrainSculptor.sculpt(geometry, this.hills);
        }

        // 3. Draw down the texture from the TextureForge
        const texUrl = `awtsmoosTex://${this.textureType}`;
        const map = await this.olam.loadTexture({ 
            url: texUrl, 
            shouldRepeat: true, 
            repeatX: this.width / 10, 
            repeatY: this.depth / 10 
        });

        const material = new THREE.MeshStandardMaterial({
            map: map,
            roughness: 0.9,
            metalness: 0.1,
            color: this.textureType === 'sand' ? 0xffddaa : 0xffffff
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.nivraAwtsmoos = this;
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;

        if (this.position) this.mesh.position.copy(this.position.vector3());

        // Setup Physics
        this.mesh.userData.isSolid = true;
        this.mesh.userData.isTerrain = true;
        this.mesh.updateMatrixWorld(true);

        await olam.hoyseef(this);
        
        // Add to the physical octree boundary
        if(this.olam.worldOctree) {
            this.olam.worldOctree.addObject(this.mesh);
        }

        this.isReady = true;
    }
}
