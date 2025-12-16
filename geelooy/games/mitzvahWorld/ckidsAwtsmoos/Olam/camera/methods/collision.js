
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
                directionAlternative.multiplyScalar(-1)
            );
        } else {
            // Otherwise, default to raycasting from the camera using the mouse pointer
            this.mouseRaycaster.setFromCamera(
                this.olam.pointer,
                this.camera
    
            );
        }
        
        
       
        // 1. Check Static Octree (Buildings, Landscape)
        let closest = null;
        var oct = this
            .olam
            .interactiveOctree
            .rayIntersect(this.mouseRaycaster.ray);
       
        if(oct) {
            oct.object = oct.triangle.awtsmoosification || oct.object; // Support older way or standard way
            closest = oct;
        }

        // 2. B"H FIX: Check Dynamic Entities (NPCs) that were skipped from Octree
        // We iterate over all interactable entities and check if they are dynamic
        if (this.olam.interactableNivrayim) {
            for (const nivra of this.olam.interactableNivrayim) {
                // Skip Chossid (Player) usually, unless desired
                if (nivra.type === 'chossid') continue;

                // Only check dynamic types that we excluded from the octree
                if (nivra.mesh && (nivra.type === 'customNpc' || nivra.type === 'medabeir' || nivra.type === 'chai')) {
                    const hits = this.mouseRaycaster.intersectObject(nivra.mesh, true); // Recursive for complex models
                    if (hits.length > 0) {
                        const hit = hits[0];
                        
                        // Ensure the hit object is linked back to the Nivra for logic to work
                        // The mesh should have 'nivraAwtsmoos' attached to it
                        // If not, we can manually attach it or just rely on the fact that 'hit.object' is part of the hierarchy
                        
                        // Check if this hit is closer than the octree hit
                        if (!closest || hit.distance < closest.distance) {
                            closest = hit;
                            
                            // Ensure robustness: bubble up to find the root mesh that has nivraAwtsmoos
                            // hit.object is the specific mesh part (e.g. 'Head'). We need the parent Nivra.
                            let curr = hit.object;
                            while(curr && !curr.nivraAwtsmoos) {
                                curr = curr.parent;
                            }
                            if (curr && curr.nivraAwtsmoos) {
                                // Fake the octree return structure for compatibility
                                closest.object = curr; 
                            }
                        }
                    }
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
