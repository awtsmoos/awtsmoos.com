
// B"H
/**
 * @file RoadAssembler.js
 * @module RoadAssembler
 * 
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE GROUNDING OF THE PATH — PROCEDURAL ROAD GENERATOR                           ║
 * ║                                                                                  ║
 * ║  "Make a straight path in the desert..." (Yeshayahu 40:3)                        ║
 * ║                                                                                  ║
 * ║  THE TIKKUN OF THE FLOATING ROAD:                                                ║
 * ║  Previously, roads cut through hills horizontally, creating impossible terrain.  ║
 * ║  Now, the Assembler takes the exact same mathematical `hills` array used by      ║
 * ║  the TerrainGenerator and applies `TerrainMath` to shift every vertex of the     ║
 * ║  road up to match the ground perfectly! Zero raycast overhead.                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import TerrainMath from '../../../../dvarim/terrain/core/TerrainMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class RoadAssembler {
    /**
     * @param {Array<Array<number>>} pointsXZ - Array of [x, z] points.
     * @param {Object} options - Configuration for width, sidewalks, hills, etc.
     */
    static build(pointsXZ, options = {}) {
        const width = options.width || 8;
        const sidewalkWidth = options.sidewalkWidth || 2;
        const sidewalkHeight = options.sidewalkHeight || 0.3;
        const hills = options.hills || [];
        
        const curvePoints = pointsXZ.map(p => new THREE.Vector3(p[0], 0, p[1]));
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        curve.curveType = 'chordal';

        const roadShape = new THREE.Shape();
        roadShape.moveTo(-width/2, 0);
        roadShape.lineTo(width/2, 0);
        
        const extrudeSettings = {
            steps: curvePoints.length * 8, // B"H: Higher steps for smooth hill draping
            bevelEnabled: false,
            extrudePath: curve
        };

        const roadGeo = new THREE.ExtrudeGeometry(roadShape, extrudeSettings);
        
        // B"H: MATH GROUNDING TIKKUN
        // Instead of raycasting, we calculate the exact height at every vertex!
        this._groundGeometry(roadGeo, hills, 0.05);

        const roadMat = new THREE.ShaderMaterial({
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
            side: THREE.DoubleSide
        });

        const roadMesh = new THREE.Mesh(roadGeo, roadMat);
        roadMesh.name = "ProceduralRoad";
        roadMesh.userData.isSolid = true;

        // 2. Create the Sidewalks
        const sidewalkShapeL = new THREE.Shape();
        sidewalkShapeL.moveTo(-width/2 - sidewalkWidth, sidewalkHeight);
        sidewalkShapeL.lineTo(-width/2, sidewalkHeight);
        sidewalkShapeL.lineTo(-width/2, 0);
        sidewalkShapeL.lineTo(-width/2 - sidewalkWidth, 0);
        
        const sidewalkShapeR = new THREE.Shape();
        sidewalkShapeR.moveTo(width/2, 0);
        sidewalkShapeR.lineTo(width/2, sidewalkHeight);
        sidewalkShapeR.lineTo(width/2 + sidewalkWidth, sidewalkHeight);
        sidewalkShapeR.lineTo(width/2 + sidewalkWidth, 0);

        const walkGeoL = new THREE.ExtrudeGeometry(sidewalkShapeL, extrudeSettings);
        const walkGeoR = new THREE.ExtrudeGeometry(sidewalkShapeR, extrudeSettings);
        const combinedWalks = BufferGeometryUtils.mergeGeometries([walkGeoL, walkGeoR], false);

        // B"H: MATH GROUNDING TIKKUN for Sidewalks
        this._groundGeometry(combinedWalks, hills, 0.05);

        const walkMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
        const sidewalkMesh = new THREE.Mesh(combinedWalks, walkMat);
        sidewalkMesh.name = "ProceduralSidewalks";
        sidewalkMesh.userData.isSolid = true;
        
        const group = new THREE.Group();
        group.add(roadMesh);
        group.add(sidewalkMesh);
        
        return group;
    }

    /**
     * @method _groundGeometry
     * @description Modifies vertex Y values to follow the hills precisely.
     */
    static _groundGeometry(geometry, hills, yOffset = 0) {
        if (!geometry || !geometry.attributes.position) return;
        const pos = geometry.attributes.position;
        
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const baseHeight = pos.getY(i); // Keeps intrinsic height (like sidewalk depth)
            
            // Calculate earth height at this exact point
            const earthY = TerrainMath.calculateHeightAt(x, z, hills);
            
            pos.setY(i, earthY + baseHeight + yOffset);
        }
        
        geometry.computeVertexNormals();
    }
}
