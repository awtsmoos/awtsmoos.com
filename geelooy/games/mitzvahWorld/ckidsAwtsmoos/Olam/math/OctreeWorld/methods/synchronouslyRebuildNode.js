
// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default {
    _synchronouslyRebuildNode(node, newMesh) {
        const geometry = (newMesh.geometry.index) ? newMesh.geometry.toNonIndexed() : newMesh.geometry;
        const positionAttribute = geometry.getAttribute('position');
        const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();

        if (positionAttribute) {
            for (let i = 0; i < positionAttribute.count; i += 3) {
                v1.fromBufferAttribute(positionAttribute, i).applyMatrix4(newMesh.matrixWorld);
                v2.fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(newMesh.matrixWorld);
                v3.fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(newMesh.matrixWorld);
                
                const newTriangle = new THREE.Triangle(v1.clone(), v2.clone(), v3.clone());
                if(!node.box.intersectsTriangle(newTriangle)) continue;

                newTriangle.sourceMesh = newMesh; 
                node.physics.addDynamicTriangle(newTriangle);
            }
        }
        if(newMesh.geometry.index) geometry.dispose();
    }
};
