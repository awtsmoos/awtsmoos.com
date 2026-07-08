
// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    fromGraphNode(group) {
        if (!group.userData.isPreTransformed) {
            group.updateWorldMatrix(true, true);
        }
       
        group.traverse((obj) => {
            if (obj.isMesh === true) {
                if (this.allTriangles.some(tri => tri.sourceMesh === obj)) {
                    this.removeMesh(obj);
                }
                
                let geometry, isTemp = false;
                if (obj.geometry.index !== null) { 
                    isTemp = true; 
                    geometry = obj.geometry.toNonIndexed(); 
                } else { 
                    geometry = obj.geometry; 
                }
    
                const positionAttribute = geometry.getAttribute('position');
                if (positionAttribute) {
                    for (let i = 0; i < positionAttribute.count; i += 3) {
                        const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i).applyMatrix4(obj.matrixWorld);
                        const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(obj.matrixWorld);
                        const v3 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(obj.matrixWorld);
                        const tri = new THREE.Triangle(v1, v2, v3);
                        tri.sourceMesh = obj;
                        this.allTriangles.push(tri);
                    }
                }
                if (isTemp) geometry.dispose();
            }
        });
    
        this.isBuilt = false;
        return this;
    }
};
