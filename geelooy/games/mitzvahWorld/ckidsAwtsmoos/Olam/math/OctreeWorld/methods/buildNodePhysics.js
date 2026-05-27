
// B"H
import { Octree as AwtsmoosOctree } from "../../AwtsmoosOctree/index.js";
import { NODE_STATE, CONFIG } from '../constants.js';

export default {
    _buildNodePhysics(node) {
        if (!node || !node.physicsMeshGroup) return;

        let totalTriangles = 0;
        const safeChildren = [];

        for (const mesh of node.physicsMeshGroup.children) {
            const geo = mesh.geometry;
            if (!geo || !geo.attributes || !geo.attributes.position) continue;
            const count = geo.index ? geo.index.count : geo.attributes.position.count;
            const tris = Math.ceil(count / 3);
            if (tris > CONFIG.MAX_TRIANGLES_PER_MESH) continue;
            totalTriangles += tris;
            if (totalTriangles > CONFIG.MAX_TRIANGLES_PER_NODE) break;
            safeChildren.push(mesh);
        }

        if (safeChildren.length === 0) {
            node.state = NODE_STATE.EMPTY;
            return;
        }

        if (totalTriangles > CONFIG.MAX_TRIANGLES_PER_NODE) {
            console.warn('B"H | OCTREE_NODE_BUILD_SKIPPED_COMPLEX', {
                totalTriangles,
                max: CONFIG.MAX_TRIANGLES_PER_NODE
            });
            node.state = NODE_STATE.READY;
            return;
        }

        const newPhysics = new AwtsmoosOctree(node.box.clone());
        newPhysics._isManaged = true;

        node.physicsMeshGroup.userData.isPreTransformed = true;
        newPhysics.fromGraphNode(node.physicsMeshGroup);
        newPhysics.build();

        if (node.physics && node.physics.dynamicTriangles.length > 0) {
            for (const tri of node.physics.dynamicTriangles) {
                if (tri.sourceMesh) newPhysics.addDynamicTriangle(tri);
            }
        }

        node.physics = newPhysics;
        node.state = NODE_STATE.READY;
    }
};
