
/**
 * B"H
 * @file visuals.js
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    minimapPos: false,
    lastPos: new THREE.Vector3(),

    postProcessing() {
        return; // Currently disabled
        var pos = new THREE.Vector3();
        if(!this.lastPos.equals(this.mesh.position)) {
           pos.copy(this.mesh.position)
            var offset = new THREE.Vector3(pos.x, 15, pos.z)
            this.olam.ayshPeula("update minimap camera", ({
                position:offset,
                targetPosition:pos
            }))
            this.lastPos.copy(pos)
            this.ayshPeula("update earlier")
        }

        var mm = this.olam.minimap
        if(!mm) return;
        if(!mm.shaderPass) return;

        var coords = pos; 
        if(!coords) return;
        this.minimapPos = coords;
        if(!this._did) this._did=true;
        
        var {x, y} = coords;  
        if(typeof(x) == "number" && typeof(y) == "number")
            mm.shaderPass.uniforms.playerPos.value = coords

        var dir = this.modelMesh.rotation.y;
        mm.shaderPass.uniforms.playerRot.value = dir;
    },

    adjustDOF() {
        if(!this.olam.postprocessing) return;
        // Logic for DOF update would go here
    }
};
