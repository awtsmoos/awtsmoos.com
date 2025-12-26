
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { NODE_STATE } from "./constants.js";

export class LODNode {
    box;
    children = [];
    type = 'LEAF';
    state = NODE_STATE.EMPTY;
    physics = null;
    physicsMeshGroup = new THREE.Group();
    constructor(box) { this.box = box; }
}
