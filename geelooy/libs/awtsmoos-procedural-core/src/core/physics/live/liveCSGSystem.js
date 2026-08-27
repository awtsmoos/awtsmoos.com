
// B"H
/**
 * @file liveCSGSystem.js
 * @brief Performs instant boolean operations on dynamic meshes.
 * 
 * THE PSALM OF THE INSTANT VOID:
 * The Master drags the sphere of light across the solid clay,
 * And instantly the matter breaks and vanishes away!
 * We do not wait for loading screens, we do not pause time,
 * The BSP tree calculates the boundary of the line!
 * Tzimtzum occurs before the eyes, the light is pulled apart,
 * Revealing the eternal void inside the Golem's heart!
 */

import { CSG } from '../../geometry/csg/index.js';
import { meshToRenderData } from '../../geometry/utils/meshData.js';
import { createCubeMesh } from '../../geometry/primitives/cube.js';
import { generateProceduralGeometry } from '../../geometry/geometryGenerator.js';

export class LiveCSGSystem {
    constructor(renderer) {
        this.renderer = renderer;
        this.relationships = [];
        console.log('B"H - LiveCSGSystem: The Sword of Tzimtzum is unsheathed.');
    }

    init() {
        this.relationships = [];
        this.renderer.objectMap.forEach(obj => {
            if (obj.liveCSG) {
                const target = this.renderer.objectMap.get(obj.liveCSG.targetId);
                if (target) {
                    // B"H - Cache the original pure geometry of the target
                    if (!target.baseCSG) {
                        const rawGeometry = generateProceduralGeometry(target.primitive, target.parameters || {}, target.modifiers || []);
                        target.baseCSG = CSG.fromMesh(rawGeometry);
                    }
                    
                    // B"H - Cache the original pure geometry of the cutter
                    if (!obj.baseCSG) {
                        const rawGeometry = generateProceduralGeometry(obj.primitive, obj.parameters || {}, obj.modifiers || []);
                        obj.baseCSG = CSG.fromMesh(rawGeometry);
                    }

                    this.relationships.push({ cutter: obj, target: target, operation: obj.liveCSG.operation });
                    
                    // Force initial cut
                    obj.isMoving = true;
                }
            }
        });
    }

    update() {
        for (const rel of this.relationships) {
            const { cutter, target, operation } = rel;
            
            // Only recalculate if the Hand of Providence is dragging the cutter
            if (cutter.isMoving) {
                const pos = cutter.keyframes[0].position;
                
                // 1. Transform the cutter's cached BSP polygons
                const transformedCutterCSG = cutter.baseCSG.clone();
                transformedCutterCSG.polygons.forEach(p => {
                    p.vertices.forEach(v => {
                        v.pos.x += pos[0];
                        v.pos.y += pos[1];
                        v.pos.z += pos[2];
                    });
                    // B"H - The plane normal stays the same for translation, but 'w' changes
                    p.plane.w = p.plane.normal.dot(p.vertices[0].pos);
                });

                // 2. Perform the Divine Annihilation (Subtraction)
                let resultCSG;
                if (operation === 'subtract') {
                    resultCSG = target.baseCSG.subtract(transformedCutterCSG);
                } else if (operation === 'intersect') {
                    resultCSG = target.baseCSG.intersect(transformedCutterCSG);
                } else {
                    resultCSG = target.baseCSG.union(transformedCutterCSG);
                }

                // 3. Convert back to structured faces
                const resultMesh = resultCSG.toMesh();
                
                // Color the cut
                resultMesh.faces.forEach(f => f.vertices.forEach(v => {
                    if (!v.col) v.col = target.shaderVars?.uBaseColor ? [...target.shaderVars.uBaseColor, 1.0] : [0.5, 0.5, 0.5, 1.0];
                }));

                // 4. Flatten to render arrays
                const renderData = meshToRenderData(resultMesh);
                
                // 5. Update the WebGL buffers dynamically
                target.positions = renderData.positions;
                target.normals = renderData.normals;
                target.colors = renderData.colors;
                target.indices = renderData.indices;
                
                // Signal the animation loop to upload the new buffers to the GPU
                target.dirty = true;
                
                // If it's not dragged by mouse anymore, reset flag
                if (!window.__IS_DRAGGING_OBJECT__) cutter.isMoving = false;
            }
        }
    }
}
