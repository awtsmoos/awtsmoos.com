
/**
 * B"H
 * @module ProceduralTerrain
 * @description
 * 🌿 THE GROUND OF REVELATION 🌿
 * 
 * Chapter 3: The Solidification of Malchus.
 * We transition from a formless plane to a solid foundation. 
 * By using the FoundationVessel (a Box), we ensure that the world's 
 * physical logic (Octree) can grasp the earth, and the user's 
 * perception (Material) can see the emerald glow.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from '/games/scripts/build/three.module.js';
import FoundationVessel from "../../Olam/methods/terrain/FoundationVessel.js";

export default class ProceduralTerrain extends Domem {
    type = "proceduralTerrain";

    constructor(op, olam) {
        super(op, olam);
        this.width = op.width || 1500;
        this.depth = op.depth || 1500;
        this.thickness = op.thickness || 4.0; // B"H: Substantial grounding
        this.segments = op.segments || 32;
        this.hills = op.hills || [];
        this.textureType = op.textureType || "safegrass";
    }

    async heescheel(olam) {
        this.olam = olam;
        const label = `[Terrain: ${this.name}]`;
        console.log(`B"H - 🌿 ${label}: Commencing manifestation of solid earth.`);

        // 1. FORGE GEOMETRY (The thick foundation)
        const geometry = FoundationVessel.carve({
            width: this.width,
            depth: this.depth,
            thickness: this.thickness,
            segments: this.segments,
            hills: this.hills
        });

        // 2. WEAVE MATERIAL (The emerald garment)
        let material;
        try {
            const texUrl = `awtsmoostex://${this.textureType}`;
            const map = await this.olam.loadTexture({ 
                url: texUrl, 
                shouldRepeat: true, 
                repeatX: this.width / 15, // Scale repeat for high-res look
                repeatY: this.depth / 15 
            });

            material = new THREE.MeshStandardMaterial({
                map: map,
                roughness: 0.9,
                metalness: 0.05,
                color: 0xffffff,
                side: THREE.FrontSide // Standard lighting for solid boxes
            });
            
            // B"H: If the texture is missing, we must NOT be transparent!
            if (!map) {
                material = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            }
        } catch(e) {
            console.warn(`B"H - ${label}: Texture Forge failed. Using emerald pigment.`, e);
            material = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        }

        // 3. ASSEMBLE MESH
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = this.name;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.visible = true;
        this.mesh.frustumCulled = false; // B"H: ABSOLUTELY ESSENTIAL! Never hide the ground.

        // 4. ALIGNMENT (Positioning top face at 0)
        FoundationVessel.rectify(this.mesh, this.thickness);
        
        // Add additional user offset if provided
        if (this.position) {
            this.mesh.position.x += this.position.x;
            this.mesh.position.z += this.position.z;
            this.mesh.position.y += this.position.y;
        }

        // 5. SOLIDIFY IN THE REVELATION
        this.mesh.updateMatrixWorld(true);
        this.mesh.userData.isSolid = true;
        this.mesh.userData.isTerrain = true;

        await olam.hoyseef(this);
        
        if(this.olam.worldOctree) {
            console.log(`B"H - ⚓ ${label}: Grounding [${this.name}] into the Octree.`);
            this.olam.worldOctree.addObject(this.mesh);
        }

        this.isReady = true;
        console.log(`B"H - ✅ ${label}: Earth is firm at Y:${this.mesh.position.y}`);
    }
}
