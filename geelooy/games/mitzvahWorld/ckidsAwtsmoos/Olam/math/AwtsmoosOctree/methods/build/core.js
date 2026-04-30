
// B"H
export default {
    addDynamicTriangle(triangle) {
        if (!this.box.intersectsTriangle(triangle)) return;
        
        if (this.subTrees.length > 0) {
            for (const subTree of this.subTrees) {
                subTree.addDynamicTriangle(triangle);
            }
        } else {
            const clone = triangle.clone();
            clone.sourceMesh = triangle.sourceMesh;
            this.dynamicTriangles.push(clone);
        }
    },
    
    addTriangle(triangle) {
        const newTriangles =[...this.allTriangles, triangle];
        this.allTriangles = newTriangles;
        
        this.worldTrianglesData = new Float32Array(newTriangles.length * 9);
        for (let i = 0; i < newTriangles.length; i++) {
            const tri = newTriangles[i];
            const baseIndex = i * 9;
            this.worldTrianglesData[baseIndex] = tri.a.x; this.worldTrianglesData[baseIndex+1] = tri.a.y; this.worldTrianglesData[baseIndex+2] = tri.a.z;
            this.worldTrianglesData[baseIndex+3] = tri.b.x; this.worldTrianglesData[baseIndex+4] = tri.b.y; this.worldTrianglesData[baseIndex+5] = tri.b.z;
            this.worldTrianglesData[baseIndex+6] = tri.c.x; this.worldTrianglesData[baseIndex+7] = tri.c.y; this.worldTrianglesData[baseIndex+8] = tri.c.z;
        }

        const newTriangleIndex = newTriangles.length - 1;
        this._insertTriangleRecursive(this, newTriangleIndex, triangle);
    },

    removeMesh(mesh) {
        const originalCount = this.allTriangles.length;
        this.allTriangles = this.allTriangles.filter(tri => tri.sourceMesh !== mesh);
        this.dynamicTriangles = this.dynamicTriangles.filter(tri => tri.sourceMesh !== mesh);

        if (this.allTriangles.length < originalCount) {
            this.isBuilt = false; 
            this.worldTrianglesData = null; 
            this.build(); 
        }
        return this;
    },

    pruneDeadTriangles() {
        const startSize = this.allTriangles.length;
        this.allTriangles = this.allTriangles.filter(tri => tri.sourceMesh && tri.sourceMesh.parent);
        this.dynamicTriangles = this.dynamicTriangles.filter(tri => tri.sourceMesh && tri.sourceMesh.parent);

        if (this.allTriangles.length < startSize) {
            this.isBuilt = false;
            this.worldTrianglesData = null;
            this.build();
        }
    },

    build() {
        if (!this._isManaged) {
            this.subTrees =[]; 
            this.box.makeEmpty();
        } else {
            this.subTrees =[];
        }
        
        this.worldTrianglesData = new Float32Array(this.allTriangles.length * 9);
        for (let i = 0; i < this.allTriangles.length; i++) {
            const tri = this.allTriangles[i];
            const baseIndex = i * 9;
            this.worldTrianglesData[baseIndex] = tri.a.x; this.worldTrianglesData[baseIndex+1] = tri.a.y; this.worldTrianglesData[baseIndex+2] = tri.a.z;
            this.worldTrianglesData[baseIndex+3] = tri.b.x; this.worldTrianglesData[baseIndex+4] = tri.b.y; this.worldTrianglesData[baseIndex+5] = tri.b.z;
            this.worldTrianglesData[baseIndex+6] = tri.c.x; this.worldTrianglesData[baseIndex+7] = tri.c.y; this.worldTrianglesData[baseIndex+8] = tri.c.z;

            if (!this._isManaged) {
                this.box.expandByPoint(tri.a).expandByPoint(tri.b).expandByPoint(tri.c);
            }
        }
        
        if(this.allTriangles.length > 0){
            this.box.min.x -= 0.01; this.box.min.y -= 0.01; this.box.min.z -= 0.01;
        }

        this.triangles = Array.from(Array(this.allTriangles.length).keys());
        this.split(0);
        
        this.isBuilt = true;
        return this;
    },

    getTriangleCount() { return this.worldTrianglesData ? this.worldTrianglesData.length / 9 : 0; },
    
    _getTriangle(index, target) {
        const base = index * 9;
        target.a.fromArray(this.worldTrianglesData, base);
        target.b.fromArray(this.worldTrianglesData, base + 3);
        target.c.fromArray(this.worldTrianglesData, base + 6);
        return target;
    }
};
