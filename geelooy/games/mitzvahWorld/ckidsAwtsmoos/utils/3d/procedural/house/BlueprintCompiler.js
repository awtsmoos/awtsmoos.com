// B"H
/**
 * @module BlueprintCompiler
 * @description
 * 🔨 THE FINAL COMPILATION — FROM DATA TO MATTER 🔨
 * 
 * This is the ONLY module that touches THREE.js.
 * All other builders emit pure data instructions (plain objects).
 * This compiler takes those instructions and materializes them
 * into actual BufferGeometry objects with proper material groups.
 * 
 * Architecture:
 *   Blueprint → DataBuilders (pure JSON) → BlueprintCompiler (THREE.js)
 */
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';

export default class BlueprintCompiler {
    /**
     * Compile an array of data instructions into a merged BufferGeometry.
     * Each instruction is: { type, params, modifiers[], materialGroup }
     */
    static compile(instructions) {
        if (!instructions || instructions.length === 0) {
            return new THREE.BoxGeometry(1, 1, 1);
        }

        // Group by materialGroup
        const groups = {};
        instructions.forEach(instr => {
            const g = instr.materialGroup ?? 0;
            if (!groups[g]) groups[g] = [];
            groups[g].push(instr);
        });

        const finalParts = [];
        const sortedKeys = Object.keys(groups).sort((a, b) => a - b);

        for (const key of sortedKeys) {
            const geoList = groups[key].map(instr => this._realize(instr)).filter(Boolean);
            if (geoList.length === 0) continue;

            const merged = geoList.length === 1 
                ? geoList[0] 
                : BufferGeometryUtils.mergeGeometries(geoList, false);
            
            if (merged) {
                const count = merged.index ? merged.index.count : merged.attributes.position.count;
                merged.clearGroups();
                merged.addGroup(0, count, parseInt(key));
                finalParts.push(merged);
            }
        }

        if (finalParts.length === 0) return new THREE.BoxGeometry(1, 1, 1);

        const houseGeo = BufferGeometryUtils.mergeGeometries(finalParts, true);
        if (!houseGeo.attributes.normal) houseGeo.computeVertexNormals();
        
        // Ensure UVs exist
        const pos = houseGeo.attributes.position;
        if (!houseGeo.attributes.uv) {
            houseGeo.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(pos.count * 2).fill(0), 2));
        }
        
        this._applyBoxUVs(houseGeo);
        houseGeo.computeBoundingBox();
        return houseGeo;
    }

    /**
     * Convert a single data instruction into a BufferGeometry.
     */
    static _realize(instr) {
        let geo = this._createPrimitive(instr);
        if (!geo) return null;

        // Apply modifiers in order
        if (instr.modifiers) {
            for (const mod of instr.modifiers) {
                geo = this._applyModifier(geo, mod);
            }
        }
        return geo;
    }

    static _createPrimitive(instr) {
        const p = instr.params || {};
        switch (instr.type) {
            case 'box':
                return new THREE.BoxGeometry(p.width || 1, p.height || 1, p.depth || 1);
            case 'plane':
                return new THREE.PlaneGeometry(p.width || 1, p.height || 1);
            case 'cylinder':
                return new THREE.CylinderGeometry(p.radiusTop ?? 0.5, p.radiusBottom ?? 0.5, p.height || 1, p.segments || 8);
            case 'sphere':
                return new THREE.SphereGeometry(p.radius || 0.5, p.wSegs || 8, p.hSegs || 6);
            case 'cone':
                return new THREE.ConeGeometry(p.radius || 1, p.height || 1, p.segments || 4);
            case 'extrude': {
                const shape = new THREE.Shape();
                const pts = p.points || [[0,0],[1,0],[0.5,1]];
                shape.moveTo(pts[0][0], pts[0][1]);
                for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
                shape.closePath();
                return new THREE.ExtrudeGeometry(shape, { depth: p.depth || 1, bevelEnabled: false });
            }
            default:
                return null;
        }
    }

    static _applyModifier(geo, mod) {
        if (!geo) return null;
        switch (mod.type) {
            case 'translate':
                geo.translate(mod.x || 0, mod.y || 0, mod.z || 0);
                break;
            case 'rotateX':
                geo.rotateX(mod.angle || 0);
                break;
            case 'rotateY':
                geo.rotateY(mod.angle || 0);
                break;
            case 'rotateZ':
                geo.rotateZ(mod.angle || 0);
                break;
            case 'scale':
                geo.scale(mod.x ?? 1, mod.y ?? 1, mod.z ?? 1);
                break;
            case 'mirror': {
                const mirrored = geo.clone();
                const matrix = new THREE.Matrix4();
                if (mod.axis === 'x') matrix.makeScale(-1, 1, 1);
                else if (mod.axis === 'y') matrix.makeScale(1, -1, 1);
                else if (mod.axis === 'z') matrix.makeScale(1, 1, -1);
                mirrored.applyMatrix4(matrix);
                return BufferGeometryUtils.mergeGeometries([geo, mirrored], false);
            }
            case 'array': {
                const count = mod.count || 1;
                const offset = mod.offset || { x: 0, y: 0, z: 0 };
                const arr = [geo];
                for (let i = 1; i < count; i++) {
                    const clone = geo.clone();
                    clone.translate((offset.x || 0) * i, (offset.y || 0) * i, (offset.z || 0) * i);
                    arr.push(clone);
                }
                return BufferGeometryUtils.mergeGeometries(arr, false);
            }
        }
        return geo;
    }

    static _applyBoxUVs(geometry) {
        const pos = geometry.attributes.position;
        const norm = geometry.attributes.normal;
        const uvs = geometry.attributes.uv;
        const scale = 0.25;

        for (let i = 0; i < pos.count; i++) {
            const nx = Math.abs(norm.getX(i));
            const ny = Math.abs(norm.getY(i));
            const nz = Math.abs(norm.getZ(i));
            const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);

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
