
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { Octree as AwtsmoosOctree } from "../../AwtsmoosOctree/index.js";
import { NODE_STATE } from '../constants.js';

const _tempBox = new THREE.Box3();

export default {
    _distributeTriangleToNodes(node, triangle, affectedNodes) {
        if (!node.box.intersectsTriangle(triangle)) return;
        
        if (node.type === 'LEAF') {
            if (!node.physics) {
                node.physics = new AwtsmoosOctree(node.box.clone());
                node.physics._isManaged = true;
            }
            
            _tempBox.setFromPoints([triangle.a, triangle.b, triangle.c]);
            node.box.union(_tempBox);
            node.physics.box.copy(node.box); 
            
            node.state = NODE_STATE.READY;
            
            const tClone = triangle.clone();
            tClone.sourceMesh = triangle.sourceMesh;
            node.physics.addDynamicTriangle(tClone);
            
            if (affectedNodes) affectedNodes.add(node);
        } else {
            const len = node.children.length;
            for (let i = 0; i < len; i++) {
                this._distributeTriangleToNodes(node.children[i], triangle, affectedNodes);
            }
        }
    }
};
