/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE PROCEDURAL GEOMETRY FACTORY — ProceduralGeometryFactory.js
 *   ──────────────────────────────────────────────────────────────────
 *   B"H - Transferred and purified from the extra/modeler source.
 *   Manifests complex organic vessels (Trees, Grass) from nothingness.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js';

/**
 * B"H - Simple Random Number Generator to keep trees consistent with their seeds.
 */
class RNG {
    constructor(seed) { this.s = seed || 123; }
    rand() {
        this.s = (this.s * 9301 + 49297) % 233280;
        return this.s / 233280;
    }
    range(min, max) { return min + this.rand() * (max - min); }
}

export class ProceduralGeometryFactory {

    /**
     * B"H - Creates a high-fidelity procedural tree.
     */
    static createTree(options = {}) {
        const ctx = {
            verts: [], norms: [], uvs: [], inds: [],
            leafVerts: [], leafNorms: [], leafUVs: [], leafInds: [], leafColors: [],
            indexOffset: 0, leafOffset: 0,
            rng: new RNG(options.seed || Math.random() * 10000),
            options: {
                branch: {
                    levels: options.levels || 3,
                    length: options.length || [5, 3.5, 2],
                    radius: options.radius || 0.4,
                    segments: options.segments || [6, 4, 3],
                    sections: options.sections || [8, 6, 4],
                    taper: options.taper || 0.7,
                    gnarliness: options.gnarliness || 0.15,
                    children: options.children || [4, 6, 0],
                    angle: options.angle || 45,
                    start: options.start || 0.2
                },
                leaves: {
                    count: options.leafCount || 15,
                    size: options.leafSize || 0.6,
                    color: options.leafColor || [0.2, 0.6, 0.1, 1.0]
                }
            }
        };

        const getParam = (name, level, def) => {
            const p = ctx.options.branch[name];
            if (p === undefined) return def;
            if (Array.isArray(p)) return p[level] !== undefined ? p[level] : def;
            return p;
        };

        const addRing = (center, frameNormal, frameBinormal, radius, segments, vCoord) => {
            const startIdx = ctx.indexOffset;
            for (let i = 0; i <= segments; i++) {
                const u = i / segments;
                const theta = u * Math.PI * 2;
                const cos = Math.cos(theta), sin = Math.sin(theta);
                
                const nx = frameNormal.x * cos + frameBinormal.x * sin;
                const ny = frameNormal.y * cos + frameBinormal.y * sin;
                const nz = frameNormal.z * cos + frameBinormal.z * sin;

                ctx.verts.push(center.x + radius * nx, center.y + radius * ny, center.z + radius * nz);
                ctx.norms.push(nx, ny, nz);
                ctx.uvs.push(u, vCoord);
                ctx.indexOffset++;
            }
            return startIdx;
        };

        const stitchRings = (startA, startB, segments) => {
            for (let i = 0; i < segments; i++) {
                const a1 = startA + i, a2 = startA + i + 1;
                const b1 = startB + i, b2 = startB + i + 1;
                ctx.inds.push(a1, a2, b1, b1, a2, b2);
            }
        };

        const addLeafQuad = (pos, s, color) => {
            const half = s / 2;
            const angle = ctx.rng.rand() * Math.PI * 2;
            const c = Math.cos(angle), si = Math.sin(angle);
            const idx = ctx.leafOffset;
            
            const addV = (ox, oy, oz, u, v) => {
                ctx.leafVerts.push(pos.x + ox, pos.y + oy, pos.z + oz);
                ctx.leafNorms.push(0, 1, 0);
                ctx.leafUVs.push(u, v);
                ctx.leafColors.push(...color);
            };

            addV(-half*c, -half, -half*si, 0, 0);
            addV(half*c, -half, half*si, 1, 0);
            addV(half*c, half, half*si, 1, 1);
            addV(-half*c, half, -half*si, 0, 1);
            ctx.leafInds.push(idx, idx+1, idx+2, idx, idx+2, idx+3);
            ctx.leafOffset += 4;
        };

        const grow = (startPos, startDir, length, radius, level) => {
            const segments = Math.max(2, Math.floor(getParam('segments', level, 6) * (length / 5)));
            const segLen = length / segments;
            const radialSegs = Math.max(3, Math.floor(getParam('sections', level, 6)));
            const taper = getParam('taper', level, 0.7);
            const gnarl = getParam('gnarliness', level, 0.1);
            
            let pos = startPos.clone();
            let dir = startDir.clone().normalize();
            let currentRadius = radius;
            
            let frameNormal = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
            let frameBinormal = new THREE.Vector3().crossVectors(dir, frameNormal).normalize();
            frameNormal.crossVectors(frameBinormal, dir).normalize();

            let prevRingStart = -1;
            const spine = [{ pos: pos.clone(), dir: dir.clone(), radius: currentRadius }];

            for (let i = 0; i <= segments; i++) {
                const progress = i / segments;
                currentRadius = Math.max(0.005, radius * (1.0 - taper * progress));
                const ringIdx = addRing(pos, frameNormal, frameBinormal, currentRadius, radialSegs, i * 0.5);
                if (prevRingStart !== -1) stitchRings(prevRingStart, ringIdx, radialSegs);
                prevRingStart = ringIdx;

                if (i < segments) {
                    const noise = new THREE.Vector3(ctx.rng.range(-gnarl, gnarl), ctx.rng.range(-gnarl, gnarl), ctx.rng.range(-gnarl, gnarl));
                    const nextDir = dir.clone().add(noise).normalize();
                    const quaternion = new THREE.Quaternion().setFromUnitVectors(dir, nextDir);
                    frameNormal.applyQuaternion(quaternion);
                    frameBinormal.applyQuaternion(quaternion);
                    dir.copy(nextDir);
                    pos.add(dir.clone().multiplyScalar(segLen));
                    spine.push({ pos: pos.clone(), dir: dir.clone(), radius: currentRadius });
                }
            }

            if (level < ctx.options.branch.levels) {
                const childCount = getParam('children', level, 0);
                const goldenAngle = 2.39996;
                let spiral = ctx.rng.rand() * Math.PI * 2;
                for (let c = 0; c < childCount; c++) {
                    const idx = Math.floor(ctx.rng.range(spine.length * 0.2, spine.length - 1));
                    const parent = spine[idx];
                    let up = Math.abs(parent.dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
                    let right = new THREE.Vector3().crossVectors(parent.dir, up).normalize();
                    let forward = new THREE.Vector3().crossVectors(right, parent.dir).normalize();
                    const theta = spiral + (c * goldenAngle);
                    let radial = right.clone().multiplyScalar(Math.cos(theta)).add(forward.clone().multiplyScalar(Math.sin(theta)));
                    const angleRad = (getParam('angle', level, 45) * Math.PI) / 180;
                    let childDir = parent.dir.clone().multiplyScalar(Math.cos(angleRad)).add(radial.multiplyScalar(Math.sin(angleRad))).normalize();
                    grow(parent.pos, childDir, getParam('length', level + 1, length * 0.6), parent.radius * 0.7, level + 1);
                }
            }

            if (level >= ctx.options.branch.levels - 1 && ctx.options.leaves.count > 0) {
                for (let i = Math.floor(spine.length * 0.4); i < spine.length; i++) {
                    if (ctx.rng.rand() > 0.6) continue;
                    const node = spine[i];
                    for (let k = 0; k < 3; k++) {
                        const offset = new THREE.Vector3(ctx.rng.range(-1, 1), ctx.rng.range(-1, 1), ctx.rng.range(-1, 1)).multiplyScalar(node.radius * 2);
                        addLeafQuad(node.pos.clone().add(offset), ctx.options.leaves.size, ctx.options.leaves.color);
                    }
                }
            }
        };

        grow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), getParam('length', 0, 5), ctx.options.branch.radius, 0);

        const branchGeo = new THREE.BufferGeometry();
        branchGeo.setAttribute('position', new THREE.Float32BufferAttribute(ctx.verts, 3));
        branchGeo.setAttribute('normal', new THREE.Float32BufferAttribute(ctx.norms, 3));
        branchGeo.setAttribute('uv', new THREE.Float32BufferAttribute(ctx.uvs, 2));
        branchGeo.setIndex(ctx.inds);

        const leafGeo = new THREE.BufferGeometry();
        leafGeo.setAttribute('position', new THREE.Float32BufferAttribute(ctx.leafVerts, 3));
        leafGeo.setAttribute('normal', new THREE.Float32BufferAttribute(ctx.leafNorms, 3));
        leafGeo.setAttribute('uv', new THREE.Float32BufferAttribute(ctx.leafUVs, 2));
        leafGeo.setAttribute('color', new THREE.Float32BufferAttribute(ctx.leafColors, 4));
        leafGeo.setIndex(ctx.leafInds);

        return { branches: branchGeo, leaves: leafGeo };
    }

    /**
     * B"H - Creates a field of procedural grass blades.
     */
    static createGrass(options = {}) {
        const count = options.count || 1000;
        const radius = options.radius || 10;
        const size = options.size || 0.4;
        const verts = [], norms = [], uvs = [], inds = [], colors = [];
        const rng = new RNG(options.seed || 777);

        for (let i = 0; i < count; i++) {
            const angle = rng.rand() * Math.PI * 2;
            const r = Math.sqrt(rng.rand()) * radius;
            const px = Math.cos(angle) * r;
            const pz = Math.sin(angle) * r;
            const py = 0;

            const h = size * (0.8 + rng.rand() * 0.4);
            const w = size * 0.1 * (0.8 + rng.rand() * 0.4);
            const rot = rng.rand() * Math.PI;

            const idx = (verts.length / 3);
            const c = Math.cos(rot), s = Math.sin(rot);

            verts.push(px - w*c, py, pz - w*s, px + w*c, py, pz + w*s, px + w*c, py + h, pz + w*s, px - w*c, py + h, pz - w*s);
            norms.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
            uvs.push(0,0, 1,0, 1,1, 0,1);
            const col = options.color || [0.4, 0.8, 0.2, 1.0];
            for(let j=0; j<4; j++) colors.push(...col);
            inds.push(idx, idx+1, idx+2, idx, idx+2, idx+3);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
        geo.setIndex(inds);
        return geo;
    }

    /**
     * B"H - Creates a procedural tube following a 3D path.
     */
    static createTube(options = {}) {
        let points = options.path || [];
        if (options.bezier) {
            points = this.generateBezierPath(options.bezier.points, options.bezier.segments || 20);
        }
        
        if (points.length < 2) return new THREE.BufferGeometry();

        const radius = options.radius || 0.2;
        const radialSegments = options.radialSegments || 8;
        const closed = options.closed || false;

        const frames = this.generatePathFrames(points, closed);
        const verts = [], norms = [], uvs = [], inds = [];

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const frame = frames[i];
            for (let j = 0; j <= radialSegments; j++) {
                const theta = (j / radialSegments) * Math.PI * 2;
                const sin = Math.sin(theta), cos = Math.cos(theta);
                
                const normal = frame.normal.clone().multiplyScalar(cos).add(frame.binormal.clone().multiplyScalar(sin)).normalize();
                const pos = p.clone().add(normal.clone().multiplyScalar(radius));
                
                verts.push(pos.x, pos.y, pos.z);
                norms.push(normal.x, normal.y, normal.z);
                uvs.push(j / radialSegments, i / (points.length - 1));
            }
        }

        const ringSize = radialSegments + 1;
        for (let i = 0; i < (closed ? points.length : points.length - 1); i++) {
            const next_i = (i + 1) % points.length;
            for (let j = 0; j < radialSegments; j++) {
                const a = i * ringSize + j;
                const b = next_i * ringSize + j;
                const c = next_i * ringSize + j + 1;
                const d = i * ringSize + j + 1;
                inds.push(a, b, d, d, b, c);
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.setIndex(inds);
        return geo;
    }

    static generateBezierPath(points, segments) {
        // Simple cubic bezier for now
        const path = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const t2 = t * t, t3 = t2 * t;
            const mt = 1 - t, mt2 = mt * mt, mt3 = mt2 * mt;
            const p = points[0].clone().multiplyScalar(mt3)
                .add(points[1].clone().multiplyScalar(3 * mt2 * t))
                .add(points[2].clone().multiplyScalar(3 * mt * t2))
                .add(points[3].clone().multiplyScalar(t3));
            path.push(p);
        }
        return path;
    }

    static generatePathFrames(points, closed) {
        const frames = [];
        let tangent = new THREE.Vector3().subVectors(points[1], points[0]).normalize();
        let normal = Math.abs(tangent.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
        let binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
        normal.crossVectors(binormal, tangent).normalize();
        frames.push({ tangent: tangent.clone(), normal: normal.clone(), binormal: binormal.clone() });

        for (let i = 0; i < points.length - 1; i++) {
            const prev = frames[i];
            let nextTangent;
            if (i < points.length - 2) nextTangent = new THREE.Vector3().subVectors(points[i+2], points[i+1]).normalize();
            else if (closed) nextTangent = new THREE.Vector3().subVectors(points[0], points[points.length-1]).normalize();
            else nextTangent = tangent;

            const quaternion = new THREE.Quaternion().setFromUnitVectors(tangent, nextTangent);
            normal.applyQuaternion(quaternion);
            binormal.applyQuaternion(quaternion);
            tangent.copy(nextTangent);
            frames.push({ tangent: tangent.clone(), normal: normal.clone(), binormal: binormal.clone() });
        }
        return frames;
    }
}
