// B"H
/**
 * @file RoadAssembler.js
 * @module RoadAssembler
 * 
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE PATH OF THE TZADDIK — PROCEDURAL ROAD GENERATOR                             ║
 * ║                                                                                  ║
 * ║  "Make a straight path..." (Yeshayahu 40:3)                                      ║
 * ║                                                                                  ║
 * ║  Takes an array of [x, z] coordinates and extrudes a complex road profile        ║
 * ║  (including sidewalks and a double yellow line via UV mapping) along it.         ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';

export default class RoadAssembler {
    /**
     * @param {Array<Array<number>>} pointsXZ - Array of [x, z] points defining the road path.
     * @param {Object} options - Configuration for width, sidewalks, etc.
     */
    static build(pointsXZ, options = {}) {
        // B"H: silent

        
        const width = options.width || 8;
        const sidewalkWidth = options.sidewalkWidth || 2;
        const sidewalkHeight = options.sidewalkHeight || 0.3;
        
        // Convert 2D points to 3D curve
        const curvePoints = pointsXZ.map(p => new THREE.Vector3(p[0], 0, p[1]));
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        curve.curveType = 'chordal';

        // 1. Create the Road Extrude Shape
        // It's a simple flat rectangle, we will use a ShaderMaterial to draw the lines
        const roadShape = new THREE.Shape();
        roadShape.moveTo(-width/2, 0);
        roadShape.lineTo(width/2, 0);
        
        const extrudeSettings = {
            steps: curvePoints.length * 5, // smoothness
            bevelEnabled: false,
            extrudePath: curve
        };

        const roadGeo = new THREE.ExtrudeGeometry(roadShape, extrudeSettings);
        
        // Road Shader: Black asphalt with double yellow line
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
                    
                    // The UV x goes across the road width.
                    // Center is roughly x = 0.5. Let's draw two lines near 0.48 and 0.52
                    float isLine1 = step(0.48, vUv.x) - step(0.49, vUv.x);
                    float isLine2 = step(0.51, vUv.x) - step(0.52, vUv.x);
                    float isLine = max(isLine1, isLine2);
                    
                    vec3 finalColor = mix(asphalt, yellow, isLine);
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });

        const roadMesh = new THREE.Mesh(roadGeo, roadMat);
        roadMesh.name = "ProceduralRoad";
        roadMesh.position.y = 0.05; // Slightly above ground
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

        const walkMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
        const sidewalkMesh = new THREE.Mesh(combinedWalks, walkMat);
        sidewalkMesh.name = "ProceduralSidewalks";
        sidewalkMesh.userData.isSolid = true;
        
        // Group them
        const group = new THREE.Group();
        group.add(roadMesh);
        group.add(sidewalkMesh);
        
        return group;
    }
}
