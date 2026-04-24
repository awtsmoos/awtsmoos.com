
/**
 * B"H
 * @file branch.js
 * Structure definition for a tree branch.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class Branch {
    constructor(origin, orientation, length, radius, level, sectionCount, segmentCount) {
        this.origin = origin.clone();
        this.orientation = orientation.clone();
        this.length = length;
        this.radius = radius;
        this.level = level;
        this.sectionCount = sectionCount;
        this.segmentCount = segmentCount;
    }
}
