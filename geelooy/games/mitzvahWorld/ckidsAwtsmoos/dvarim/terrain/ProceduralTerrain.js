
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
        console.log(`B"H - 🌿 ${label}: Manifesting green plane with geometric hills.`);

        // 1. FORGE GEOMETRY (Segmented Plane)
        const segments = this.segments || 64;
        const geometry = new THREE.PlaneGeometry(this.width, this.depth, segments, segments);
        geometry.rotateX(-Math.PI / 2); 

        // 2. APPLY HILLS (Manual Vertex Modification)
        if (this.hills && this.hills.length > 0) {
            const pos = geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                const z = pos.getZ(i);
                let h = 0;
                for (const hill of this.hills) {
                    const dx = x - (hill.x || 0);
                    const dz = z - (hill.z || 0);
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < (hill.radius || 50)) {
                        const influence = (1 + Math.cos((Math.PI * dist) / hill.radius)) / 2;
                        h += influence * (hill.height || 10);
                    }
                }
                pos.setY(i, h);
            }
            geometry.computeVertexNormals();
        }

        // 3. FORGE MATERIAL (Custom Emerald Shader)
        // B"H: We request the procedural shader from the scribe
        const material = await olam.generateThreeJsMesh({
            name: this.name,
            toyr: { "AwtsmoosEmeraldMaterial": {} }
        }).then(m => m.material);

        if (material) {
            material.side = THREE.DoubleSide;
            console.log(`B"H - 🧪 ${label} MATERIAL [Shader]: Activated.`);
        }

        // 4. ASSEMBLE MESH
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = this.name;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.visible = true;
        this.mesh.frustumCulled = false; 

        // 5. POSITIONING
        if (this.position) {
            this.mesh.position.set(
                (this.position.x || 0),
                (this.position.y || 0),
                (this.position.z || 0)
            );
        }

        // 6. SOLIDIFY
        this.mesh.updateMatrixWorld(true);
        this.mesh.userData.isSolid = true;
        this.mesh.userData.isTerrain = true;

        await olam.hoyseef(this);
        
        if(this.olam.worldOctree) {
            console.log(`B"H - ⚓ ${label}: Grounding into the Octree.`);
            this.olam.worldOctree.addObject(this.mesh);
        }

        this.isReady = true;
        console.log(`B"H - ✅ ${label}: Plane with hills manifest at Y:${this.mesh.position.y}.`);
    }
}
