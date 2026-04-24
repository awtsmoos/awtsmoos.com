

// B"H

export default {
    updateSceneObjects(newObjects) {
        this.objectsInScene = newObjects;
        this.previousResults.clear(); // Clear cache when scene objects change
    },

    performOptimizedRaycasting(isCorrected) {
        let isSceneChanged = this.isSceneChanged();

        for (let obj of this.objectsInScene) {
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
            // If startAlternative and directionAlternative are provided, set the ray manually
            this
            .mouseRaycaster
            .set(
                startAlternative, 
                directionAlternative.multiplyScalar(-1) // Direction might need normalization if not already
            );
        } else {
            // Otherwise, default to raycasting from the camera using the mouse pointer
            this.mouseRaycaster.setFromCamera(
                this.olam.pointer,
                this.camera
    
            );
        }
        
        let closest = null;
        
        // 1. B"H FIX: Check Dynamic Entities (NPCs) FIRST
        // This ensures moving characters are prioritized over static background geometry.
        if (this.olam.interactableNivrayim) {
            for (const nivra of this.olam.interactableNivrayim) {
                // Skip Chossid (Player)
                if (nivra.type === 'chossid') continue;

                // Only check entities that have a visible mesh
                if (nivra.mesh && nivra.mesh.visible) {
                    // Check intersection against the entire mesh hierarchy of the NPC
                    const hits = this.mouseRaycaster.intersectObject(nivra.mesh, true); 
                    
                    if (hits.length > 0) {
                        const hit = hits[0];
                        
                        // Check if this hit is closer than previous hits
                        if (!closest || hit.distance < closest.distance) {
                            closest = {
                                distance: hit.distance,
                                point: hit.point,
                                object: hit.object,
                                nivraAwtsmoos: nivra // Direct reference to the logic class
                            };
                        }
                    }
                }
            }
        }

        // 2. Check Static Octree (Buildings, Landscape)
        // Only if no dynamic entity hit yet OR the static hit is closer
        if (this.olam.interactiveOctree) {
            var oct = this
                .olam
                .interactiveOctree
                .rayIntersect(this.mouseRaycaster.ray);
        
            if(oct) {
                // B"H: If we already hit an NPC, compare distances
                if (!closest || oct.distance < closest.distance) {
                     oct.object = oct.triangle.sourceMesh || oct.object; // Support sourceMesh from octree build
                     
                     // B"H: If the static object is actually linked to a dynamic entity (like a solid NPC), retrieve it
                     if (oct.object && oct.object.nivraAwtsmoos) {
                         oct.nivraAwtsmoos = oct.object.nivraAwtsmoos;
                     }
                     
                     closest = oct;
                }
            }
        }
        
        if(closest) return closest;

        return null;

        //
    },

    isSceneChanged() {
        // Implement logic to determine if scene objects have changed
        // This can be based on a flag that is set when objects are added/removed/modified
        return false;
    }
};
