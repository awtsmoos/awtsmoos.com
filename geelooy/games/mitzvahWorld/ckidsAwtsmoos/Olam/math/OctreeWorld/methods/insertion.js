
// B"H
/**
 * @module OctreeWorld_Insertion
 * @description
 * 🕊️ THE MULTIPLICITY OF UNITY 🕊️
 * 
 * Chapter 15: Overlapping Realities.
 * In a standard DOM, one element cannot have two parents. But in the physics world,
 * a large brick might overlap 4 nodes. If we simply 'add' the mesh, it vanishes 
 * from the first three!
 * 
 * THE TIKKUN:
 * We now clone the physics twin for every Leaf Node it intersects. Each clone 
 * inherits the absolute world matrix, ensuring the physics grid is a perfect, 
 * unbroken reflection of the visual world.
 */
import { NODE_STATE } from '../constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    /**
     * @method _insertMeshOnly
     * @description Recursively finds and populates all leaf nodes overlapping a mesh.
     */
    _insertMeshOnly(node, mesh, meshBox) {
        if (!node.box.intersectsBox(meshBox)) return false;
        
        if (node.type === 'LEAF') {
            // B"H: ABSOLUTE CLONING PROTOCOL
            // Prevent mesh theft between siblings!
            const localClone = mesh.clone();
            localClone.matrixWorld.copy(mesh.matrixWorld);
            localClone.userData = { ...mesh.userData };
            
            node.physicsMeshGroup.add(localClone);
            node.state = NODE_STATE.PENDING_BUILD;
            
            // Fast build if we have a small budget
            if (node.physics) this._synchronouslyRebuildNode(node, localClone);
            else this._buildNodePhysics(node);
            
            return true;
        } else {
            let placed = false;
            for (const child of node.children) {
                if (this._insertMeshOnly(child, mesh, meshBox)) placed = true;
            }
            return placed;
        }
    },

    /**
     * @method _distributeMeshes
     * @description Deeply redistributes meshes from parent to newly formed children.
     */
    _distributeMeshes(node, mesh) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
        
        if (!node.box.intersectsBox(worldBox)) return;
        
        if (node.type === 'LEAF') {
            const clone = mesh.clone();
            clone.matrixWorld.copy(mesh.matrixWorld);
            node.physicsMeshGroup.add(clone);
            node.state = NODE_STATE.PENDING_BUILD;
            return;
        }
        
        node.children.forEach(child => this._distributeMeshes(child, mesh));
    }
};
