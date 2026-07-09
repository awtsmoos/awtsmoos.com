// B"H
/**
 * @module JSONMeshBuilder
 * @description
 * 🌌 THE BEIS HAMIKDASH OF PROCEDURAL GEOMETRY 🌌
 * An insanely robust, modular, data-driven JSON geometry engine.
 * Orchestrates Primitives, Specialized Architecture, Modifiers, and Topology edits.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

import PrimitiveFactory from './JSONMesh/PrimitiveFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import SpecializedFactory from './JSONMesh/SpecializedFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import ModifierFactory from './JSONMesh/ModifierFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import TopologyFactory from './JSONMesh/TopologyFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import RawMeshFactory from './JSONMesh/RawMeshFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class JSONMeshBuilder {
    static generate(instructions) {
        if (!instructions || !Array.isArray(instructions)) {
            return new THREE.BoxGeometry(1, 1, 1);
        }

        let finalGeometries = [];

        instructions.forEach(instr => {
            // 1. Create Base Geometry
            let geo = PrimitiveFactory.create(instr) || 
                      SpecializedFactory.create(instr) || 
                      RawMeshFactory.create(instr);
            
            if (geo) {
                // 2. Apply Modifiers
                if (instr.modifiers && Array.isArray(instr.modifiers)) {
                    instr.modifiers.forEach(mod => {
                        geo = ModifierFactory.apply(geo, mod);
                    });
                }
                
                // 3. Apply Legacy Modifiers (backwards compatibility)
                if (instr.translate || instr.rotate || instr.scale) {
                    geo = ModifierFactory.apply(geo, { type: 'translate', ...instr.translate });
                    geo = ModifierFactory.apply(geo, { type: 'rotate', ...instr.rotate });
                    geo = ModifierFactory.apply(geo, { type: 'scale', ...instr.scale });
                }

                // 4. Apply Topology Operations
                if (instr.topology && Array.isArray(instr.topology)) {
                    instr.topology.forEach(topOp => {
                        geo = TopologyFactory.process(geo, topOp);
                    });
                }

                // 5. Material Groups & UVs
                if (instr.materialIndex !== undefined) {
                    geo.clearGroups();
                    const count = geo.index ? geo.index.count : geo.attributes.position.count;
                    geo.addGroup(0, count, instr.materialIndex);
                }
                
                if (instr.boxUVs) {
                    this.applyBoxUVs(geo, instr.uvScale || 0.25);
                }

                finalGeometries.push(geo);
            }
        });

        if (finalGeometries.length === 0) return new THREE.BoxGeometry(1, 1, 1);
        
        const merged = BufferGeometryUtils.mergeGeometries(finalGeometries, true);
        merged.computeVertexNormals();
        return merged;
    }

    static applyBoxUVs(geometry, scale = 0.25) {
        if (!geometry.attributes.normal) geometry.computeVertexNormals();
        const pos = geometry.attributes.position;
        const norm = geometry.attributes.normal; 
        
        if (!geometry.attributes.uv) {
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(pos.count * 2).fill(0), 2));
        }
        
        const uvs = geometry.attributes.uv;
        
        for (let i = 0; i < pos.count; i++) {
            const nx = Math.abs(norm.getX(i));
            const ny = Math.abs(norm.getY(i));
            const nz = Math.abs(norm.getZ(i));
            
            const px = pos.getX(i);
            const py = pos.getY(i);
            const pz = pos.getZ(i);
            
            if (ny > nx && ny > nz) {
                uvs.setXY(i, px * scale, pz * scale);
            } else if (nz > nx && nz > ny) {
                uvs.setXY(i, px * scale, py * scale);
            } else {
                uvs.setXY(i, pz * scale, py * scale);
            }
        }
    }
}
