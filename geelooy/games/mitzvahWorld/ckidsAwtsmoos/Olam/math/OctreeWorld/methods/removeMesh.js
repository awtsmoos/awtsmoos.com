
// B"H
/**
 * @module OctreeWorld_RemoveMesh
 * @description
 * 🧹 THE PURIFICATION OF THE VOID 🧹
 * 
 * Chapter 5: Erasing the Imprint.
 * When a vessel is removed from the eyes, it must also be removed from the touch.
 * If the physics data lingers, the soul will collide with "Nothingness"—an invisible
 * remnant of what once was.
 * 
 * This module traverses the spatial quadrants and extracts any physics clones 
 * that are tethered to the original mesh.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    /**
     * @method removeMesh
     * @description Utterly un-creates a mesh from the collision world.
     * @param {THREE.Mesh} mesh - The mesh to purge.
     */
    removeMesh(mesh) {
        if (!this.root || !mesh) return;
        
        // The visual reference is the key to the physical twin.
        const visualRef = mesh.userData?.visualReference || mesh;
        
        // Refresh the bounds to find where the imprint lived.
        mesh.updateMatrixWorld(true);
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const meshBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
        
        // Search all quadrants overlapping these bounds.
        const nodes = this._findLeafNodesInBox(this.root, meshBox);

        // B"H: silent


        nodes.forEach(node => {
            // Find the physical clone in this specific quadrant.
            const cloneToRemove = node.physicsMeshGroup.children.find(c => 
                (c.userData?.visualReference === visualRef) || (c === mesh)
            );
            
            if (cloneToRemove) {
                node.physicsMeshGroup.remove(cloneToRemove);
                // If the node was baked into triangles, we must tell it to forget.
                if (node.physics) {
                    node.physics.removeMesh(cloneToRemove); 
                }
            }
        });

        // Dissolve any temporary satellite manifestations.
        this._pendingOctrees = this._pendingOctrees.filter(sat => sat.sourceMesh !== visualRef);
    }
};
