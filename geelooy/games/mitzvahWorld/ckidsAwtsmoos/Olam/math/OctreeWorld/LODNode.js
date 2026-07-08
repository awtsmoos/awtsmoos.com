
/**
 * B"H
 * LODNode Class
 */
import { Group } from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { NODE_STATE } from './constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class LODNode {
    constructor(box) {
        this.box = box;
        this.children = [];
        this.type = 'LEAF';
        this.state = NODE_STATE.EMPTY;
        this.physics = null;
        this.physicsMeshGroup = new Group();
    }
}
