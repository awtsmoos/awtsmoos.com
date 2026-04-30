
// B"H
import { Octree as AwtsmoosOctree } from "../../AwtsmoosOctree/index.js";
import { NODE_STATE, CONFIG } from '../constants.js';

export default {
    _buildNodePhysics(node) {
        let totalTriangles = 0;
        for(const mesh of node.physicsMeshGroup.children) {
             const geo = mesh.geometry;
             const count = geo.index ? geo.index.count : geo.attributes.position.count;
             totalTriangles += (count / 3);
        }

        if (totalTriangles > CONFIG.MAX_TRIANGLES_PER_NODE) {
            console.warn(`B"H - 🏔️ Node geometry exceeds complexity bounds. Rejecting build to preserve speed.`);
            return; 
        }

        const newPhysics = new AwtsmoosOctree(node.box.clone());
        newPhysics._isManaged = true;
        
        if (node.physicsMeshGroup.children.length > 0) {
            // Because our meshes are already explicitly placed globally, 
            // we stop fromGraphNode from resetting them via parent hierarchy.
            node.physicsMeshGroup.userData.isPreTransformed = true;
            newPhysics.fromGraphNode(node.physicsMeshGroup);
            newPhysics.build();
        }
        
        if (node.physics && node.physics.dynamicTriangles.length > 0) {
            for(const tri of node.physics.dynamicTriangles) {
                if(tri.sourceMesh) newPhysics.addDynamicTriangle(tri);
            }
        }
        
        node.physics = newPhysics;
        node.state = NODE_STATE.READY;
    }
};
