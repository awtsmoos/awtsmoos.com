// B"H
/**
 * @file polygonTreeNode.js
 * @brief Manages hierarchical splits of polygons to preserve the original soul of the form.
 */
export class PolygonTreeNode {
    constructor() {
        this.parent = null;
        this.children = [];
        this.polygon = null;
        this.removed = false;
    }

    addChild(polygon) {
        const newchild = new PolygonTreeNode();
        newchild.parent = this;
        newchild.polygon = polygon;
        this.children.push(newchild);
        return newchild;
    }

    addPolygons(polygons) {
        polygons.forEach(p => this.addChild(p));
    }

    remove() {
        if (!this.removed) {
            this.removed = true;
            if (this.parent) {
                const i = this.parent.children.indexOf(this);
                if (i >= 0) this.parent.children.splice(i, 1);
                this.parent.recursivelyInvalidatePolygon();
            }
        }
    }

    recursivelyInvalidatePolygon() {
        let node = this;
        while (node && node.polygon) {
            node.polygon = null;
            node = node.parent;
        }
    }

    getPolygons(result) {
        if (this.polygon) {
            result.push(this.polygon);
        } else {
            this.children.forEach(c => c.getPolygons(result));
        }
    }

    splitByPlane(plane, coplanarFront, coplanarBack, front, back) {
        if (this.children.length) {
            this.children.forEach(c => c.splitByPlane(plane, coplanarFront, coplanarBack, front, back));
            return;
        }
        this._split(plane, coplanarFront, coplanarBack, front, back);
    }

    _split(plane, coplanarFront, coplanarBack, front, back) {
        if (!this.polygon) return;
        const split = plane.splitPolygon(this.polygon);
        switch (split.type) {
            case 0: coplanarFront.push(this); break;
            case 1: coplanarBack.push(this); break;
            case 2: front.push(this); break;
            case 3: back.push(this); break;
            case 4:
                if (split.front) front.push(this.addChild(split.front));
                if (split.back) back.push(this.addChild(split.back));
                break;
        }
    }
}
