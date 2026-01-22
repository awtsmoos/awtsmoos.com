
/**
 * B"H
 * LODNode Class
 */
import { Group } from '/games/scripts/build/three.module.js';
import { NODE_STATE } from './constants.js';

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
