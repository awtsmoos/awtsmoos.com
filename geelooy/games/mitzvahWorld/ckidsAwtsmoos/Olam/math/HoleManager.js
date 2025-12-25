//B"H
/**
 * HoleManager - Tracks "masks" in the physical world to allow mining without voxelizing.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class HoleManager {
    static holes = []; 
    static maxHoles = 50;

    /**
     * Manifests a new hole in the world.
     */
    static addHole(position, radius, olam) {
        this.holes.push({ position: position.clone(), radius });
        if (this.holes.length > this.maxHoles) this.holes.shift();

        // Update Physics - The octree intersection check will now ignore these zones
        if (olam.worldOctree) {
            olam.worldOctree.holes = this.holes;
        }

        // Update Shaders
        olam.scene.traverse(child => {
            if (child.isMesh && child.material && child.material.userData.shader) {
                this.updateMaterial(child.material);
            }
        });
    }

    static updateMaterial(material) {
        const shader = material.userData.shader;
        if (!shader) return;
        
        shader.uniforms.uHoles.value = this.holes.map(h => h.position);
        shader.uniforms.uHoleRadii.value = this.holes.map(h => h.radius);
        shader.uniforms.uNumHoles.value = this.holes.length;
    }

    static injectHoleLogic(material) {
        material.onBeforeCompile = (shader) => {
            shader.uniforms.uHoles = { value: new Array(this.maxHoles).fill(new THREE.Vector3()) };
            shader.uniforms.uHoleRadii = { value: new Array(this.maxHoles).fill(0) };
            shader.uniforms.uNumHoles = { value: 0 };

            shader.vertexShader = `varying vec3 vWorldPos;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                `#include <worldpos_vertex>\nvWorldPos = worldPosition.xyz;`
            );

            shader.fragmentShader = `
                uniform vec3 uHoles[${this.maxHoles}];
                uniform float uHoleRadii[${this.maxHoles}];
                uniform int uNumHoles;
                varying vec3 vWorldPos;
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `#include <dithering_fragment>
                for(int i = 0; i < uNumHoles; i++) {
                    if(distance(vWorldPos, uHoles[i]) < uHoleRadii[i]) {
                        discard;
                    }
                }
                `
            );
            material.userData.shader = shader;
        };
    }
}
