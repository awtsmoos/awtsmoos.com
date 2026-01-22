// B"H
/**
 * @file collision.js
 * Camera and Mouse raycasting logic.
 */
export default {
    updateSceneObjects(newObjects) {
        this.objectsInScene = newObjects;
        this.previousResults.clear(); // Clear cache when scene objects change
    },

    performOptimizedRaycasting(isCorrected) {
        let isSceneChanged = this.isSceneChanged();
        
        // B"H: If the player is driving, we ignore the vehicle mesh to avoid instant camera zoom-in
        const ignoreMesh = (this.target && this.target.drivingVehicle) ? this.target.drivingVehicle.mesh : null;

        for (let obj of this.objectsInScene) {
            // Skip the vehicle the player is currently driving
            if (obj === ignoreMesh) continue;

            let collisionResults;
            if (isSceneChanged || !this.previousResults.has(obj)) {
                collisionResults = this.raycaster.intersectObject(obj, true);
                this.previousResults.set(obj, collisionResults);
            } else {
                collisionResults = this.previousResults.get(obj);
            }

            if (collisionResults.length > 0) {
                let distanceToObject = collisionResults[0].distance - this.offsetFromWall;
                if (distanceToObject < this.correctedDistance) {
                    this.correctedDistance = distanceToObject;
                    isCorrected = true;
                }
            }
        }

        return isCorrected;
    },
    
    getHovered(
        startAlternative,
        directionAlternative
    ) {
        if (startAlternative && directionAlternative) {
            // B"H FIX: Cloned the directionAlternative before multiplying. 
            // In Three.js, multiplyScalar modifies the original vector.
            this
            .mouseRaycaster
            .set(
                startAlternative, 
                directionAlternative.clone().multiplyScalar(-1) 
            );
        } else {
            this.mouseRaycaster.setFromCamera(
                this.olam.pointer,
                this.camera
    
            );
        }
        
        let closest = null;
        
        // 1. B"H FIX: Check Dynamic Entities (NPCs) FIRST
        if (this.olam.interactableNivrayim) {
            for (const nivra of this.olam.interactableNivrayim) {
                if (nivra.type === 'chossid') continue;

                if (nivra.mesh && nivra.mesh.visible) {
                    const hits = this.mouseRaycaster.intersectObject(nivra.mesh, true); 
                    
                    if (hits.length > 0) {
                        const hit = hits[0];
                        
                        if (!closest || hit.distance < closest.distance) {
                            closest = {
                                distance: hit.distance,
                                point: hit.point,
                                object: hit.object,
                                nivraAwtsmoos: nivra 
                            };
                        }
                    }
                }
            }
        }

        // 2. Check Static Octree
        if (this.olam.interactiveOctree) {
            var oct = this
                .olam
                .interactiveOctree
                .rayIntersect(this.mouseRaycaster.ray);
        
            if(oct) {
                if (!closest || oct.distance < closest.distance) {
                     oct.object = oct.triangle.sourceMesh || oct.object;
                     
                     if (oct.object && oct.object.nivraAwtsmoos) {
                         oct.nivraAwtsmoos = oct.object.nivraAwtsmoos;
                     }
                     
                     closest = oct;
                }
            }
        }
        
        if(closest) return closest;

        return null;
    },

    isSceneChanged() {
        return false;
    }
};
