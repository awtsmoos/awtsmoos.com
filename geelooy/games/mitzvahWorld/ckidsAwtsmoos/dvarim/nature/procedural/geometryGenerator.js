// B"H

/**
 * @file geometryGenerator.js
 * @module GeometryGenerator
 *
 * ══════════════════════════════════════════════════════════════════════
 * THE YOTZER (FORMER) — SUPREME GEOMETRY GENERATOR
 * ══════════════════════════════════════════════════════════════════════
 *
 * Chapter 5: The Shaping of Form from Formlessness
 *
 * "Blessed is He Who formed the luminaries with wisdom..." — Morning Prayer
 *
 * The Yotzer Ohr — the "Former of Light" — shapes raw potential
 * into specific form. So too this module: raw FloatArrays and indices
 * emerge from pure mathematics into the vivid geometry of rocks and grass.
 *
 * Key Innovations over previous version:
 *   1. BUFFER GEOMETRY BATCHING — entire tuft generated at once
 *      as a single merged Float32Array, no per-blade cloning
 *   2. Rock geometry now uses LAYERED DISPLACEMENT — 3 frequency bands
 *      creating small/medium/large variation simultaneously
 *   3. Grass blades store their individual height in a custom attribute
 *      for the shader to read (player interaction)
 *   4. ALL geometry built from scratch with typed arrays — no GC pressure
 *
 * @description Extreme data-driven procedural geometry for nature elements
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/** 
 * @constant GRASS_CONFIG
 * @description Pure data controlling grass generation
 */
const GRASS_CONFIG = {
    bladesPerTuft:  12,
    segments:        5,     // Joints per blade
    bladeWidth:      0.08,
    bladeHeight:     0.75,
    bendFactor:      0.55,  // How much each blade bends
    spreadRadius:    0.18,  // XZ spread of blades in tuft
};

/**
 * @constant ROCK_CONFIG
 * @description Pure data controlling rock generation
 */
const ROCK_CONFIG = {
    baseRadius:    0.42,
    detail:         1,      // IcosahedronGeometry detail
    noiseFreqs:    [1.8, 4.5, 11.0],   // 3 frequency bands
    noiseAmps:     [0.22, 0.10, 0.025], // Corresponding amplitudes
    flattenBottom: 0.55,    // How much to flatten the underside
};

export default {

    /**
     * @method get
     * @param {string} type
     * @returns {THREE.BufferGeometry}
     */
    get(type) {
        if (type.includes('grass')) return this.grass(type);
        if (type.includes('rock'))  return this.rock(type);
        return new THREE.BoxGeometry(0.5, 0.5, 0.5);
    },

    // ══════════════════════════════════════════════════════════════════
    // GRASS — built as one giant typed array batch
    // ══════════════════════════════════════════════════════════════════

    /**
     * @method grass
     * @description Builds a full grass tuft as ONE merged BufferGeometry.
     *   All blades are generated into a single Float32Array buffer —
     *   no per-blade THREE.PlaneGeometry, no clone(), no GC.
     *
     * @param {string} type
     * @returns {THREE.BufferGeometry}
     */
    grass(type) {
        const cfg = GRASS_CONFIG;
        const seg = cfg.segments;

        // Each blade: (seg+1) rows × 2 verts per row = 2*(seg+1) verts
        // Each blade: seg quads × 2 tris × 3 verts = 6*seg indices
        const vertsPerBlade   = 2 * (seg + 1);
        const indicesPerBlade = 6 * seg;

        const totalVerts   = vertsPerBlade   * cfg.bladesPerTuft;
        const totalIndices = indicesPerBlade * cfg.bladesPerTuft;

        const positions  = new Float32Array(totalVerts * 3);
        const normals    = new Float32Array(totalVerts * 3);
        const uvs        = new Float32Array(totalVerts * 2);
        const heights    = new Float32Array(totalVerts);   // Custom: blade height 0→1
        const indices    = new Uint32Array(totalIndices);

        let vi = 0; // vertex index (in elements)
        let ii = 0; // index index

        for (let b = 0; b < cfg.bladesPerTuft; b++) {
            const vBase = b * vertsPerBlade;

            // Random blade parameters
            const angle  = (b / cfg.bladesPerTuft) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
            const tiltX  = (Math.random() - 0.5) * 0.35;
            const tiltZ  = (Math.random() - 0.5) * 0.35;
            const height = cfg.bladeHeight * (0.7 + Math.random() * 0.6);
            const width  = cfg.bladeWidth  * (0.6 + Math.random() * 0.8);
            const ox     = (Math.random() - 0.5) * cfg.spreadRadius;
            const oz     = (Math.random() - 0.5) * cfg.spreadRadius;

            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            for (let s = 0; s <= seg; s++) {
                const t      = s / seg;                        // 0 at root, 1 at tip
                const y      = t * height;
                const taper  = Math.max(0, 1 - Math.pow(t, 1.2)); // width taper
                const bend   = Math.pow(t, 2) * cfg.bendFactor;   // Z bend

                // Left and right vertex of this row
                const halfW  = width * taper * 0.5;

                // World-space positions (rotated by blade angle)
                const lx = ox + cosA * (-halfW) - sinA * bend;
                const lz = oz + sinA * (-halfW) + cosA * bend;
                const rx = ox + cosA * ( halfW) - sinA * bend;
                const rz = oz + sinA * ( halfW) + cosA * bend;

                // Tilt the blade top
                const tyOffset = tiltX * y;
                const tzOffset = tiltZ * y;

                const iL = vBase + s * 2;
                const iR = vBase + s * 2 + 1;

                // Positions
                positions[iL * 3 + 0] = lx + tyOffset;
                positions[iL * 3 + 1] = y;
                positions[iL * 3 + 2] = lz + tzOffset;

                positions[iR * 3 + 0] = rx + tyOffset;
                positions[iR * 3 + 1] = y;
                positions[iR * 3 + 2] = rz + tzOffset;

                // Normals (approximate: face away from center)
                const nx = -sinA;
                const nz =  cosA;
                normals[iL * 3 + 0] = nx; normals[iL * 3 + 1] = 0.3; normals[iL * 3 + 2] = nz;
                normals[iR * 3 + 0] = nx; normals[iR * 3 + 1] = 0.3; normals[iR * 3 + 2] = nz;

                // UVs
                uvs[iL * 2 + 0] = 0.0; uvs[iL * 2 + 1] = t;
                uvs[iR * 2 + 0] = 1.0; uvs[iR * 2 + 1] = t;

                // Height attribute (for shader)
                heights[iL] = t;
                heights[iR] = t;
            }

            // Build indices for this blade (2 triangles per segment row)
            for (let s = 0; s < seg; s++) {
                const base = vBase + s * 2;
                // Triangle 1
                indices[ii++] = base;
                indices[ii++] = base + 1;
                indices[ii++] = base + 2;
                // Triangle 2
                indices[ii++] = base + 1;
                indices[ii++] = base + 3;
                indices[ii++] = base + 2;
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('normal',   new THREE.BufferAttribute(normals,   3));
        geo.setAttribute('uv',       new THREE.BufferAttribute(uvs,       2));
        geo.setAttribute('aHeight',  new THREE.BufferAttribute(heights,   1));
        geo.setIndex(new THREE.BufferAttribute(indices, 1));

        return geo;
    },

    // ══════════════════════════════════════════════════════════════════
    // ROCK — multi-frequency displacement for realistic shape
    // ══════════════════════════════════════════════════════════════════

    /**
     * @method rock
     * @description Generates a rock using 3-band fractal displacement.
     *   Low freq  → overall boulder shape
     *   Mid freq  → medium bumps and ridges  
     *   High freq → surface texture roughness
     *
     * @param {string} type
     * @returns {THREE.BufferGeometry}
     */
    rock(type) {
        const cfg  = ROCK_CONFIG;
        const seed = Math.random() * 1000;

        // Start from an icosahedron for even vertex distribution
        const geo  = new THREE.IcosahedronGeometry(cfg.baseRadius, cfg.detail);
        const pos  = geo.attributes.position;
        const vec  = new THREE.Vector3();

        // Random stretch/squash ratios for overall silhouette variety
        const stretchX = 0.75 + Math.random() * 0.5;
        const stretchY = 0.55 + Math.random() * 0.45;
        const stretchZ = 0.75 + Math.random() * 0.5;

        for (let i = 0; i < pos.count; i++) {
            vec.fromBufferAttribute(pos, i);

            // 3-frequency displacement (large → medium → small)
            let displacement = 1.0;
            for (let f = 0; f < 3; f++) {
                const freq = cfg.noiseFreqs[f];
                const amp  = cfg.noiseAmps[f];
                // Trilinear noise using sine products (cheap but effective)
                const n = Math.sin(vec.x * freq + seed)
                        * Math.cos(vec.y * freq + seed * 1.3)
                        * Math.sin(vec.z * freq + seed * 0.7);
                displacement += n * amp;
            }

            // Apply stretch + displacement
            vec.x *= stretchX;
            vec.y *= stretchY;
            vec.z *= stretchZ;
            vec.multiplyScalar(displacement);

            // Flatten underside — rocks don't float
            if (vec.y < -cfg.baseRadius * cfg.flattenBottom) {
                vec.y = -cfg.baseRadius * cfg.flattenBottom;
            }

            pos.setXYZ(i, vec.x, vec.y, vec.z);
        }

        // Recompute normals after displacement
        if (geo.attributes.normal) geo.deleteAttribute('normal');
        geo.computeVertexNormals();

        return geo;
    },
};
