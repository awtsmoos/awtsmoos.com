
// B"H
export default {
    findLeafNodesInBox(startNode, box, result = []) {
        if (!startNode.box.intersectsBox(box)) return result;
        
        if (startNode.type === 'LEAF') {
            result.push(startNode);
        } else if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                this.findLeafNodesInBox(child, box, result);
            }
        }
        return result;
    },
    
    findLeafNodeAtPoint(startNode, point) {
        if (!startNode.box.containsPoint(point)) return null;
        
        if (startNode.type === 'LEAF') return startNode;
        
        if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                const result = this.findLeafNodeAtPoint(child, point);
                if (result) return result;
            }
        }
        return null;
    },

    getNodeDepth(nodeToFind, startNode = this.world.root, depth = 0) {
        if (nodeToFind === startNode) return depth;
        
        if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                if (child.box.containsBox(nodeToFind.box) || child.box.intersectsBox(nodeToFind.box)) {
                    const foundDepth = this.getNodeDepth(nodeToFind, child, depth + 1);
                    if (foundDepth !== -1) return foundDepth;
                }
            }
        }
        return -1;
    }
};
