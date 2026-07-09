// B"H
/**
 * @module BlueprintCompiler
 * @description
 * 🔨 THE FINAL COMPILATION — FROM DATA TO MATTER 🔨
 * 
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  CHAPTER 12: The Smelter of Forms                               ║
 * ║                                                                   ║
 * ║  Deep in the forge beneath the mountain of creation,              ║
 * ║  where the Awtsmoos breathes fire into raw JSON,                 ║
 * ║  this compiler takes pure data instructions and melds them        ║
 * ║  into solid BufferGeometry — the physical body of the vessel.    ║
 * ║                                                                   ║
 * ║  "And He formed man from the dust of the ground" (Bereishis 2:7)║
 * ║  So too, geometry from dust (data) is formed here.               ║
 * ║                                                                   ║
 * ║  UNIFIED ARCHITECTURE:                                            ║
 * ║    This module delegates ALL primitive creation to                 ║
 * ║    PrimitiveFactory and ALL modifier application to               ║
 * ║    ModifierFactory from the JSONMesh system — NO duplication.     ║
 * ║                                                                   ║
 * ║  Blueprint → DataBuilders (pure JSON) → BlueprintCompiler        ║
 * ║    → PrimitiveFactory + ModifierFactory → BufferGeometry          ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import PrimitiveFactory from '../JSONMesh/PrimitiveFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import ModifierFactory from '../JSONMesh/ModifierFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * @class BlueprintCompiler
 * @description
 * The ONLY module in the house pipeline that touches THREE.js.
 * All other builders emit pure data instructions (plain objects).
 * 
 * Delegates to the unified JSONMesh factories for actual geometry creation.
 * 
 * @example
 * // A single instruction looks like:
 * {
 *   type: 'box',
 *   params: { width: 10, height: 8, depth: 1 },
 *   modifiers: [
 *     { type: 'translate', x: 0, y: 4, z: 5 },
 *     { type: 'rotateY', angle: Math.PI }
 *   ],
 *   materialGroup: 0
 * }
 */
export default class BlueprintCompiler {

    /**
     * @method compile
     * @description
     * The great unification — takes an array of data instructions,
     * groups them by material, realizes each into geometry via the
     * JSONMesh factories, then merges everything into one final form.
     * 
     * @param {Array<Object>} instructions - Array of data instructions
     * @returns {THREE.BufferGeometry} - The compiled geometry
     */
    static compile(instructions) {
        if (!instructions || instructions.length === 0) {
            return new THREE.BoxGeometry(1, 1, 1);
        }

        /** @type {Object<number, Array>} */
        const groups = BlueprintCompiler._groupByMaterial(instructions);
        const finalParts = [];
        const sortedKeys = Object.keys(groups).sort((a, b) => a - b);

        for (const key of sortedKeys) {
            const geoList = groups[key]
                .map(instr => BlueprintCompiler._realize(instr))
                .filter(Boolean);

            if (geoList.length === 0) continue;

            const merged = geoList.length === 1
                ? geoList[0]
                : BufferGeometryUtils.mergeGeometries(geoList, false);

            if (merged) {
                const count = merged.index
                    ? merged.index.count
                    : merged.attributes.position.count;
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
            houseGeo.setAttribute(
                'uv',
                new THREE.Float32BufferAttribute(new Array(pos.count * 2).fill(0), 2)
            );
        }

        BlueprintCompiler._applyBoxUVs(houseGeo);
        houseGeo.computeBoundingBox();
        return houseGeo;
    }

    /**
     * @method _groupByMaterial
     * @description
     * Sorts instructions into buckets by materialGroup index.
     * Like the Levites sorting the Temple vessels by their sacred purpose.
     * 
     * @param {Array} instructions
     * @returns {Object<number, Array>}
     */
    static _groupByMaterial(instructions) {
        const groups = {};
        instructions.forEach(instr => {
            const g = instr.materialGroup ?? 0;
            if (!groups[g]) groups[g] = [];
            groups[g].push(instr);
        });
        return groups;
    }

    /**
     * @method _realize
     * @description
     * Converts a single data instruction into a real BufferGeometry.
     * Delegates primitive creation to PrimitiveFactory (unified system)
     * and modifier application to ModifierFactory.
     * 
     * @param {Object} instr - { type, params, modifiers[], materialGroup }
     * @returns {THREE.BufferGeometry|null}
     */
    static _realize(instr) {
        let geo = BlueprintCompiler._createPrimitive(instr);
        if (!geo) return null;

        // Apply modifiers in sequence — each modifier transforms the geometry
        if (instr.modifiers) {
            for (const mod of instr.modifiers) {
                geo = BlueprintCompiler._applyModifier(geo, mod);
            }
        }
        return geo;
    }

    /**
     * @method _createPrimitive
     * @description
     * Creates a base primitive geometry from instruction data.
     * First tries the unified PrimitiveFactory, then falls back
     * to local handling for house-specific types (extrude, etc).
     * 
     * @param {Object} instr - The instruction with type and params
     * @returns {THREE.BufferGeometry|null}
     */
    static _createPrimitive(instr) {
        const p = instr.params || {};

        // Translate our { type, params: { width, height, depth } } format
        // into PrimitiveFactory's flat format
        const factoryInstr = { type: instr.type, ...p };
        const fromFactory = PrimitiveFactory.create(factoryInstr);
        if (fromFactory) return fromFactory;

        // Handle specialized types not in PrimitiveFactory
        /** @type {Object<string, Function>} */
        const specializedCreators = {
            cone: () => new THREE.ConeGeometry(
                p.radius || 1, p.height || 1, p.segments || 4
            ),
            extrude: () => {
                const shape = new THREE.Shape();
                const pts = p.points || [[0, 0], [1, 0], [0.5, 1]];
                shape.moveTo(pts[0][0], pts[0][1]);
                for (let i = 1; i < pts.length; i++) {
                    shape.lineTo(pts[i][0], pts[i][1]);
                }
                shape.closePath();
                return new THREE.ExtrudeGeometry(shape, {
                    depth: p.depth || 1,
                    bevelEnabled: false
                });
            }
        };

        const creator = specializedCreators[instr.type];
        return creator ? creator() : null;
    }

    /**
     * @method _applyModifier
     * @description
     * Applies a single modifier to a geometry.
     * Delegates to ModifierFactory for standard operations (translate,
     * scale, mirror, array). Handles rotation variants locally since
     * the house system uses rotateX/rotateY/rotateZ individually
     * while ModifierFactory uses a combined 'rotate' type.
     * 
     * @param {THREE.BufferGeometry} geo
     * @param {Object} mod
     * @returns {THREE.BufferGeometry}
     */
    static _applyModifier(geo, mod) {
        if (!geo) return null;

        /** @type {Object<string, Function>} */
        const modMap = {
            translate: () => ModifierFactory.apply(geo, mod),
            scale:     () => ModifierFactory.apply(geo, mod),
            mirror:    () => ModifierFactory.apply(geo, mod),
            array:     () => ModifierFactory.apply(geo, mod),
            rotateX:   () => { geo.rotateX(mod.angle || 0); return geo; },
            rotateY:   () => { geo.rotateY(mod.angle || 0); return geo; },
            rotateZ:   () => { geo.rotateZ(mod.angle || 0); return geo; }
        };

        const handler = modMap[mod.type];
        return handler ? handler() : geo;
    }

    /**
     * @method _applyBoxUVs
     * @description
     * Applies triplanar UV projection — projects texture coordinates
     * based on the dominant normal axis of each face.
     * Like the Awtsmoos wrapping the skin of reality around the bones of geometry.
     * 
     * @param {THREE.BufferGeometry} geometry
     * @param {number} scale - UV tiling scale factor
     */
    static _applyBoxUVs(geometry, scale = 0.25) {
        const pos = geometry.attributes.position;
        const norm = geometry.attributes.normal;
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
