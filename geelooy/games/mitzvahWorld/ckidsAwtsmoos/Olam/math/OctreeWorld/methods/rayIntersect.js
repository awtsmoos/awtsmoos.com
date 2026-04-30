
// B"H
export default {
    rayIntersect(ray) {
        let closestResult = false;
        const check = (octree) => {
            const res = octree.rayIntersect(ray);
            if (res && (!closestResult || res.distance < closestResult.distance)) {
                closestResult = res;
            }
        };

        if (this.root) {
            const candidates = this._findLeafNodesInBox(this.root, this.root.box);
            for (const node of candidates) {
                if (node.physics) check(node.physics);
            }
        }
        for (const sat of this._pendingOctrees) {
            if (ray.intersectsBox(sat.box)) check(sat);
        }
        return closestResult;
    }
};
