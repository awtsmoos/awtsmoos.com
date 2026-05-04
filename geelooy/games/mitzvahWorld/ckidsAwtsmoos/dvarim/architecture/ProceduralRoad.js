// B"H
/**
 * @file ProceduralRoad.js
 * @module ProceduralRoad
 * @description THE PATH OF THE CHASSID — Abstracted and Purified.
 */

import Tzomayach from "../../chayim/tzomayach.js";

export default class ProceduralRoad extends Tzomayach {
    type = "ProceduralRoad";

    constructor(op, olam) {
        super(op, olam);
        this.points = op.points || [[0,0], [10,10]];
        this.width = op.width || 8;
        this.sidewalkWidth = op.sidewalkWidth || 2;
        this.sidewalkHeight = op.sidewalkHeight || 0.3;
        this.curveType = op.curveType || 'smooth'; // 'smooth' or 'linear'
        this.isSolid = op.isSolid ?? true;
    }

    async heescheel(olam) {
        this.olam = olam;
        
        let curve;
        if (this.curveType === 'linear') {
            const vPoints = this.points.map(p => new THREE.Vector3(p[0], 0, p[1]));
            curve = new THREE.CurvePath();
            for(let i=0; i<vPoints.length - 1; i++) {
                curve.add(new THREE.LineCurve3(vPoints[i], vPoints[i+1]));
            }
        } else {
            curve = this.createCatmullRomCurve3(this.points);
        }

        const roadShape = this.createShape();
        roadShape.moveTo(-this.width/2, 0);
        roadShape.lineTo(this.width/2, 0);
        
        const extrudeSettings = {
            steps: this.points.length * 5,
            bevelEnabled: false,
            extrudePath: curve
        };

        const roadGeo = this.createExtrudeGeometry(roadShape, extrudeSettings);
        
        const roadMat = this.createRawShaderMaterial({
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                void main() {
                    vec3 asphalt = vec3(0.15, 0.15, 0.15);
                    vec3 yellow = vec3(0.9, 0.8, 0.1);
                    float isLine1 = step(0.48, vUv.x) - step(0.49, vUv.x);
                    float isLine2 = step(0.51, vUv.x) - step(0.52, vUv.x);
                    float isLine = max(isLine1, isLine2);
                    gl_FragColor = vec4(mix(asphalt, yellow, isLine), 1.0);
                }
            `,
            side: 2 // DoubleSide
        });

        const roadMesh = this.createMesh(roadGeo, roadMat);
        roadMesh.position.y = 0.05; 
        roadMesh.userData.isSolid = true;

        const sidewalkShapeL = this.createShape();
        sidewalkShapeL.moveTo(-this.width/2 - this.sidewalkWidth, this.sidewalkHeight);
        sidewalkShapeL.lineTo(-this.width/2, this.sidewalkHeight);
        sidewalkShapeL.lineTo(-this.width/2, 0);
        sidewalkShapeL.lineTo(-this.width/2 - this.sidewalkWidth, 0);
        
        const sidewalkShapeR = this.createShape();
        sidewalkShapeR.moveTo(this.width/2, 0);
        sidewalkShapeR.lineTo(this.width/2, this.sidewalkHeight);
        sidewalkShapeR.lineTo(this.width/2 + this.sidewalkWidth, this.sidewalkHeight);
        sidewalkShapeR.lineTo(this.width/2 + this.sidewalkWidth, 0);

        const walkGeoL = this.createExtrudeGeometry(sidewalkShapeL, extrudeSettings);
        const walkGeoR = this.createExtrudeGeometry(sidewalkShapeR, extrudeSettings);
        const combinedWalks = this.mergeGeometries([walkGeoL, walkGeoR], false);

        const walkMat = this.createMaterial('Standard', { color: 0x888888, roughness: 0.9 });
        const sidewalkMesh = this.createMesh(combinedWalks, walkMat);
        sidewalkMesh.userData.isSolid = true;
        
        this.mesh = this.createGroup();
        this.mesh.add(roadMesh);
        this.mesh.add(sidewalkMesh);
        this.mesh.name = `ProceduralRoad_${this.id}`;

        const p = this.position ? (typeof this.position.vector3 === 'function' ? this.position.vector3() : this.position) : {x:0, y:0, z:0};
        this.mesh.position.set(p.x, p.y || 0, p.z);

        this.mesh.updateMatrixWorld(true);

        await olam.hoyseef(this);
        
        if (this.isSolid && olam.worldOctree) olam.worldOctree.fromGraphNode(this.mesh);

        this.isReady = true;
        this.ayshPeula("heescheel", this);
    }
}
