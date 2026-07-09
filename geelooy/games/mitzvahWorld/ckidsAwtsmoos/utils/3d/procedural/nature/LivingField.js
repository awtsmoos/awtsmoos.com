
/**
 * B"H
 * @module LivingField
 * @description
 * Spawns an interactive, grounded field of life. 
 * Every blade of grass probes the Octree physics world to find the ground beneath it.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import GrassBladeGeometry from "./GrassBladeGeometry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class LivingField {
    /**
     * @function generate
     * @description Summons instanced grass that respects terrain height.
     */
    static generate(olam, count = 2000, radius = 40, center = new THREE.Vector3()) {
        const geometry = GrassBladeGeometry.generate();
        const material = new THREE.MeshLambertMaterial({
            color: 0x44aa44,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.InstancedMesh(geometry, material, count);
        const dummy = new THREE.Object3D();
        const raycaster = new THREE.Raycaster();
        const rayDown = new THREE.Vector3(0, -1, 0);

        for (let i = 0; i < count; i++) {
            const r = radius * Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            
            const x = center.x + r * Math.cos(theta);
            const z = center.z + r * Math.sin(theta);
            
            // B"H: The Ground Snapping! 
            // We probe the physical world from high above down.
            let y = center.y;
            if (olam.worldOctree) {
                raycaster.set(new THREE.Vector3(x, 100, z), rayDown);
                const hit = olam.worldOctree.rayIntersect(raycaster.ray);
                if (hit) y = hit.position.y;
            }

            dummy.position.set(x, y, z);
            dummy.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.2);
            const s = 0.5 + Math.random() * 1.5;
            dummy.scale.set(s, s, s);
            
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            mesh.setColorAt(i, new THREE.Color().setHSL(0.3 + Math.random() * 0.05, 0.4, 0.2 + Math.random() * 0.2));
        }

        mesh.instanceMatrix.needsUpdate = true;
        if(mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        
        return mesh;
    }
}
