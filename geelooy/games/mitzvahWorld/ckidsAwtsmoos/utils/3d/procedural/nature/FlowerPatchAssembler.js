// B"H
/**
 * @file FlowerPatchAssembler.js
 * @description Generates a single instanced mesh for hundreds of procedural flowers.
 */

import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { FLOWER_VERTEX_SHADER, FLOWER_FRAGMENT_SHADER, getFlowerUniforms } from '../../../../shaders/FlowerShader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class FlowerPatchAssembler {
    static build(count = 100, radius = 10, type = 'rose') {

        // Base geometry: simple quad curved upward (petal shape)
        const petalGeo = new THREE.PlaneGeometry(0.3, 0.3, 2, 2);
        
        // Curve the petal
        const posAttr = petalGeo.attributes.position;
        for(let i=0; i<posAttr.count; i++) {
            let y = posAttr.getY(i);
            // push Z back based on Y
            posAttr.setZ(i, posAttr.getZ(i) + (y * y * 0.5)); 
        }
        petalGeo.computeVertexNormals();

        const instancedGeo = new THREE.InstancedBufferGeometry();
        instancedGeo.copy(petalGeo);
        instancedGeo.instanceCount = count;

        const dummy = new THREE.Object3D();
        const matrixArray = new Float32Array(count * 16);

        for (let i = 0; i < count; i++) {
            // Random position in circle
            const r = Math.random() * radius;
            const theta = Math.random() * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;
            
            dummy.position.set(x, 0.15, z); // slight elevation

            // Flowers rotate slightly around Y
            dummy.rotation.set(0, Math.random() * Math.PI, 0);
            
            // Random scale
            const s = 0.5 + Math.random() * 0.5;
            dummy.scale.set(s, s, s);

            dummy.updateMatrix();
            dummy.matrix.toArray(matrixArray, i * 16);
        }

        instancedGeo.setAttribute('instanceMatrix', new THREE.InstancedBufferAttribute(matrixArray, 16));

        const mat = new THREE.ShaderMaterial({
            vertexShader: FLOWER_VERTEX_SHADER,
            fragmentShader: FLOWER_FRAGMENT_SHADER,
            uniforms: getFlowerUniforms(type),
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false
        });

        const mesh = new THREE.Mesh(instancedGeo, mat);
        mesh.name = `FlowerPatch_${type}`;
        mesh.frustumCulled = false;
        
        return mesh;
    }
}
