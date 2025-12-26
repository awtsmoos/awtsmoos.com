//B"H
/**
 * HoleManager - Tracks "masks" in the physical world.
 * Hardened against undefined array values.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class HoleManager {
    static holes = []; 
    static maxHoles = 16; 
    
    static _dummyVector = new THREE.Vector3(0, -99999, 0);

    static get dummyVector() {
        if (!this._dummyVector) this._dummyVector = new THREE.Vector3(0, -99999, 0);
        return this._dummyVector;
    }

    static addHole(position, radius, olam) {
        if (!position) return;
        this.holes.push({ position: position.clone(), radius });
        if (this.holes.length > this.maxHoles) this.holes.shift();

        if (olam.worldOctree) {
            olam.worldOctree.holes = this.holes;
        }

        if (olam.scene) {
            olam.scene.traverse(child => {
                if (child.isMesh && child.material) {
                    this.updateMaterial(child.material);
                }
                if (child.isMesh && child.customDepthMaterial) {
                    this.updateMaterial(child.customDepthMaterial);
                }
            });
        }
    }

    static updateMaterial(material) {
        if (!material || !material.userData || !material.userData.shader) return;
        
        const shader = material.userData.shader;
        if (!shader.uniforms) return;
        
        // If uniforms aren't initialized yet by onBeforeCompile, we can't update them
        if (!shader.uniforms.uHoles || !shader.uniforms.uHoles.value) return;
        
        const count = HoleManager.holes.length;
        const max = HoleManager.maxHoles;

        const paddedHoles = [];
        const paddedRadii = [];

        for (let i = 0; i < max; i++) {
            if (i < count && HoleManager.holes[i] && HoleManager.holes[i].position) {
                paddedHoles.push(HoleManager.holes[i].position.clone()); 
                paddedRadii.push(HoleManager.holes[i].radius || 0);
            } else {
                paddedHoles.push(new THREE.Vector3(0, -99999, 0));
                paddedRadii.push(0);
            }
        }
        
        shader.uniforms.uHoles.value = paddedHoles;
        shader.uniforms.uHoleRadii.value = paddedRadii;
        
        if(shader.uniforms.uNumHoles) {
             shader.uniforms.uNumHoles.value = count;
        }
    }

    static injectHoleLogic(material) {
        if (!material) return;
        material.userData.hasHoleLogic = true;
        
        // console.log("B\"H Injecting Hole Logic into material:", material.name || "unnamed");

        material.onBeforeCompile = (shader) => {
            const max = HoleManager.maxHoles;
            
            // B"H: Initialize with valid safe data immediately
            const initHoles = [];
            const initRadii = [];
            for(let i=0; i<max; i++) {
                initHoles.push(new THREE.Vector3(0, -99999, 0));
                initRadii.push(0);
            }
            
            // console.log("B\"H Initializing uHoles uniform with size:", initHoles.length);

            shader.uniforms.uHoles = { value: initHoles };
            shader.uniforms.uHoleRadii = { value: initRadii };
            shader.uniforms.uNumHoles = { value: 0 };

            shader.vertexShader = `varying vec3 vWorldPos;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                `#include <worldpos_vertex>\nvWorldPos = worldPosition.xyz;`
            );

            shader.fragmentShader = `
                uniform vec3 uHoles[${max}];
                uniform float uHoleRadii[${max}];
                uniform int uNumHoles;
                varying vec3 vWorldPos;
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `#include <dithering_fragment>
                for(int i = 0; i < ${max}; i++) {
                    if (i >= uNumHoles) break; 
                    if(distance(vWorldPos, uHoles[i]) < uHoleRadii[i]) {
                        discard;
                    }
                }
                `
            );
            
            material.userData.shader = shader;
            
            // If holes exist, populate immediately
            if (HoleManager.holes.length > 0) {
                 HoleManager.updateMaterial(material);
            }
        };
    }
}
