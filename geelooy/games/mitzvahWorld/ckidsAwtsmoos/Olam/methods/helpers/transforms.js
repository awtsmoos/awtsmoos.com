
// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import Utils from '../../../utils.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

export default {
    getForwardVector() {
        return Utils.getForwardVector(
            this.ayin.camera,
            this.cameraObjectDirection
        );
    },

    getSideVector() {
        return Utils.getSideVector(
            this.ayin.cameraFollower,
            this.cameraObjectDirection
        );
    },

    refreshCameraAspect() {
        if(!this.activeCamera) {
            if(this.ayin) {
                this.ayin.setSize(this.width, this.height);
            }
        } else {
            this.activeCamera.aspect = this.width / this.height;
            this.activeCamera.updateProjectionMatrix();
        }
    },

    getTransformation(child) {
        child.updateMatrixWorld();
        var position = new THREE.Vector3();
        var rotation = new THREE.Quaternion();
        var scale = new THREE.Vector3();

        child.matrixWorld.decompose(position, rotation, scale);

        return { position, rotation, scale };
    },

    setMeshOnTop(sourceMesh, targetMesh) {
        if (!(sourceMesh instanceof THREE.Mesh) || !(targetMesh instanceof THREE.Mesh)) {
          console.error('Invalid arguments: sourceMesh and targetMesh must be instances of THREE.Mesh.');
          return;
        }
        
        const sourceWorldPos = new THREE.Vector3();
        const targetWorldPos = new THREE.Vector3();
        sourceMesh.getWorldPosition(sourceWorldPos);
        targetMesh.getWorldPosition(targetWorldPos);

        const displacementY = sourceMesh.geometry.boundingBox.max.y - sourceMesh.geometry.boundingBox.min.y;
        targetMesh.position.y += displacementY;    
    },

    placePlaneOnTopOfBox(plane, box) {
        box.updateMatrixWorld();
        plane.updateMatrixWorld();
    
        const boxBoundingBox = new THREE.Box3().setFromObject(box);
        const boxTopY = boxBoundingBox.max.y;
    
        plane.position.set(plane.position.x, boxTopY, plane.position.z);
        return boxTopY;
    }
};
