
// B"H
/**
 * @module OctreeWorld_Traversal
 * @description
 * 👁️ THE VOYAGE THROUGH THE DIMENSIONS 👁️
 * 
 * Chapter 4: Finding the Local Spark.
 * Space is vast, but our search must be precise. This module contains the 
 * algorithms for traversing the LOD (Level of Detail) hierarchy to find
 * specific leaf nodes containing mass at a point or within a box.
 */
export default {
    /**
     * @method _findLeafNodesInBox
     * @description Gathers all terminal quadrants within a given spatial range.
     * @param {Object} startNode 
     * @param {THREE.Box3} box 
     * @param {Array} result 
     */
    _findLeafNodesInBox(startNode, box, result = []) {
        if (!startNode.box.intersectsBox(box)) return result;
        
        if (startNode.type === 'LEAF') {
            result.push(startNode);
        } else if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                this._findLeafNodesInBox(child, box, result);
            }
        }
        return result;
    },
    
    /**
     * @method _findLeafNodeAtPoint
     * @description Locates the single point in reality that contains a specific coordinate.
     * @param {Object} startNode 
     * @param {THREE.Vector3} point 
     */
    _findLeafNodeAtPoint(startNode, point) {
        if (!startNode.box.containsPoint(point)) return null;
        if (startNode.type === 'LEAF') return startNode;
        if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                const result = this._findLeafNodeAtPoint(child, point);
                if (result) return result;
            }
        }
        return null;
    },

    /**
     * @method _getNodeDepth
     * @description Determines how far down the tree of life a specific node resides.
     */
    _getNodeDepth(nodeToFind, startNode = this.root, depth = 0) {
        if (nodeToFind === startNode) return depth;
        if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                if (child.box.containsBox(nodeToFind.box) || child.box.intersectsBox(nodeToFind.box)) {
                    const foundDepth = this._getNodeDepth(nodeToFind, child, depth + 1);
                    if (foundDepth !== -1) return foundDepth;
                }
            }
        }
        return -1;
    }
};
