// B"H

/**
 * @file proceduralTree.js
 * @module ProceduralTree
 *
 * ══════════════════════════════════════════════════════════════════════
 * THE TREE OF LIFE — Stable Procedural Tree (Rewritten)
 * ══════════════════════════════════════════════════════════════════════
 *
 * Chapter 12: The Sprouting of Branches.
 *
 * PREVIOUS BUG:
 * The recursive _growBranches accumulated rotation angles without clamping.
 * After 4 levels at ±72° per branch, branches pointed downward.
 * bGeo.rotateX was called AFTER translate(0, L/2, 0), rotating geometry
 * around world origin (0,0,0) instead of the branch base — causing
 * exponentially exploding geometry and NaN in the octree.
 *
 * FIX: Replaced with a simple, deterministic structure:
 *   - Trunk: cylinder from y=0 to y=trunkH
 *   - 4 main branches: at 70% height, fixed outward angles (max ±35°)
 *   - Leaf cluster: sphere-like flat quads at top + branch ends
 *
 * All geometry is built in LOCAL space relative to (0,0,0).
 * Scale is applied via group.scale — never baked into vertices.
 * Physics proxy is a cylinder the same height as the trunk.
 *
 * @extends Domem
 */
import Domem from "../../chayim/domem/index.js";
import { BARK_SNIPPETS } from "../../shaders/BarkShader.js";
import { LEAF_SNIPPETS } from "../../shaders/LeafShader.js";

// ── B"H: Pure data branch descriptors ──────────────────────────────────────

/**
 * @constant BRANCH_ANGLES
 * @description
 * Fixed, safe branch angle pairs [angleX, angleZ] in radians.
 * Max ±35° (PI/5.1) from vertical — guarantees all branches point UP.
 * Four branches at cardinal outward directions for a full crown.
 *
 * @type {Array<[number, number]>}
 */
const BRANCH_ANGLES = [
    [  Math.PI / 5.5,   Math.PI / 5.5  ],
    [ -Math.PI / 5.5,   Math.PI / 5.5  ],
    [  Math.PI / 5.5,  -Math.PI / 5.5  ],
    [ -Math.PI / 5.5,  -Math.PI / 5.5  ],
];

/**
 * @constant LEAF_OFFSETS
 * @description Leaf quad positions relative to a crown center.
 * @type {Array<[number, number, number]>}
 */
const LEAF_OFFSETS = [
    [  0,    0,   0  ],
    [  1.2,  0.5, 0  ],
    [ -1.2,  0.5, 0  ],
    [  0,    0.5, 1.2],
    [  0,    0.5,-1.2],
    [  0.8,  1.2, 0.8],
    [ -0.8,  1.2,-0.8],
];

export default class ProceduralTree extends Domem {
    type = "proceduralTree";

    constructor(op, olam) {
        super(op, olam);
        this.name    = op.name || "Tree_" + Math.floor(Math.random() * 9999);
        this.isSolid = op.isSolid !== false;

        // B"H: Tree dimensions from data
        this._trunkH  = 8  + Math.random() * 4;   // 8–12
        this._trunkR  = 0.5 + Math.random() * 0.3; // 0.5–0.8
        this._leafSz  = 2.5 + Math.random() * 1.5; // 2.5–4
        this._branchL = this._trunkH * 0.45;
    }

    // ── GEOMETRY GENERATION ──────────────────────────────────────────────────

    /**
     * @method _buildTrunk
     * @description
     * A single tapered cylinder from y=0 to y=trunkH.
     * All vertex positions are finite, deterministic, NaN-free.
     *
     * @returns {BufferGeometry}
     */
    _buildTrunk() {
        const geo = this.createCylinderGeometry(
            this._trunkR * 0.5,  // top radius (tapered)
            this._trunkR,         // bottom radius
            this._trunkH,
            8
        );
        if (!geo) return null;
        // B"H: THREE.CylinderGeometry is centered; shift so base=y:0, tip=y:trunkH
        geo.translate(0, this._trunkH / 2, 0);
        return geo;
    }

    /**
     * @method _buildBranch
     * @description
     * Single branch cylinder. Starts at (0,0,0) pointing up, then rotates.
     * CRITICAL: translate to center FIRST, rotate SECOND, place THIRD.
     * This ensures rotation happens around branch BASE at origin.
     *
     * @param {number} attachY    - Y height on trunk where branch attaches
     * @param {number} angleX     - X rotation (radians)
     * @param {number} angleZ     - Z rotation (radians)
     * @returns {BufferGeometry}
     */
    _buildBranch(attachY, angleX, angleZ) {
        const L   = this._branchL;
        const r   = this._trunkR * 0.4;
        const geo = this.createCylinderGeometry(r * 0.3, r, L, 6);
        if (!geo) return null;

        // Step 1: Center vertically so BASE is at y=0
        geo.translate(0, L / 2, 0);

        // Step 2: Rotate around BASE (which IS at origin after step 1)
        geo.rotateX(angleX);
        geo.rotateZ(angleZ);

        // Step 3: Move base to attachment point on trunk
        geo.translate(0, attachY, 0);

        return geo;
    }

    /**
     * @method _buildLeafCluster
     * @description
     * A cluster of flat quads forming a spherical leaf cloud.
     * Placed at the given world position (cx, cy, cz) in local space.
     *
     * @param {number} cx - center X
     * @param {number} cy - center Y
     * @param {number} cz - center Z
     * @returns {Array<BufferGeometry>}
     */
    _buildLeafCluster(cx, cy, cz) {
        const s = this._leafSz;
        return LEAF_OFFSETS.map(([ox, oy, oz]) => {
            const geo = this.createBoxGeometry(s, 0.12, s);
            if (!geo) return null;
            // Random rotation for naturalistic look
            geo.rotateX(Math.random() * Math.PI * 0.4 - 0.2);
            geo.rotateY(Math.random() * Math.PI);
            geo.translate(cx + ox * (s * 0.5), cy + oy * (s * 0.5), cz + oz * (s * 0.5));
            return geo;
        }).filter(Boolean);
    }

    /**
     * @method generateGeometry
     * @description
     * ════════════════════════════════════════════════════════════════════
     * THE SPEECH OF CREATION — Stable Tree Geometry Assembly
     * ════════════════════════════════════════════════════════════════════
     *
     * Assembles: trunk + 4 fixed-angle branches + crown + branch-tip leaves.
     * All geometry uses deterministic math — no recursive accumulation.
     * NaN is impossible by design.
     *
     * @returns {{ branchGeos: BufferGeometry[], leafGeos: BufferGeometry[] }}
     */
    generateGeometry() {
        const branchGeos = [];
        const leafGeos   = [];

        // 1. Trunk
        const trunk = this._buildTrunk();
        if (trunk) branchGeos.push(trunk);

        // 2. Crown leaf cluster at trunk top
        const crownY = this._trunkH + this._leafSz * 0.4;
        leafGeos.push(...this._buildLeafCluster(0, crownY, 0));

        // 3. Four branches at 70% trunk height + their tip clusters
        const attachY = this._trunkH * 0.7;

        for (const [angleX, angleZ] of BRANCH_ANGLES) {
            const branch = this._buildBranch(attachY, angleX, angleZ);
            if (branch) branchGeos.push(branch);

            // B"H: Compute branch tip in local space (same math, no recursion)
            const tipX = Math.sin(angleZ) * this._branchL;
            const tipY = attachY + Math.cos(angleZ) * Math.cos(angleX) * this._branchL;
            const tipZ = Math.sin(angleX) * this._branchL;

            // Guard: if tip Y is somehow < attachY, skip leaf (shouldn't happen)
            if (tipY >= attachY) {
                leafGeos.push(...this._buildLeafCluster(tipX, tipY, tipZ));
            }
        }

        return { branchGeos, leafGeos };
    }

    // ── LIFECYCLE ────────────────────────────────────────────────────────────

    /**
     * @method heescheel
     * @description World initialization — build geometry, create meshes, ground.
     */
    async heescheel(olam) {
        this.olam = olam;

        this.treeGroup = this.createGroup();
        if (!this.treeGroup) return;

        const { branchGeos, leafGeos } = this.generateGeometry();

        // B"H: Bark material via materialGenerator (with safety fallback)
        let barkMat;
        if (olam.materialGenerator) {
            barkMat = await olam.materialGenerator.bark('oak_bark');
        } else {
            barkMat = this.createMaterial('Lambert', { color: 0x4b3621 });
        }
        
        const barkGeo = this.mergeGeometries(branchGeos);
        if (barkGeo) {
            const barkMesh = this.createMesh(barkGeo, barkMat);
            barkMesh.castShadow    = true;
            barkMesh.receiveShadow = true;
            this.treeGroup.add(barkMesh);
            this._barkMat = barkMat;
        }

        // B"H: Leaf material via materialGenerator (with safety fallback)
        let leafMat;
        if (olam.materialGenerator) {
            leafMat = await olam.materialGenerator.leaf('oak_leaf');
        } else {
            leafMat = this.createMaterial('Lambert', { color: 0x228b22 });
        }

        const leafGeo = this.mergeGeometries(leafGeos);
        if (leafGeo) {
            const leafMesh = this.createMesh(leafGeo, leafMat);
            leafMesh.castShadow    = true;
            leafMesh.receiveShadow = true;
            this.treeGroup.add(leafMesh);
            this._leafMat = leafMat;
        }

        this.mesh = this.treeGroup;
        this.mesh.nivraAwtsmoos = this;

        // B"H: Position from data
        const p = this._getValidVector(this.position);
        this.mesh.position.set(p.x, p.y, p.z);

        const rot = this._getValidVector(this.rotation);
        this.mesh.rotation.set(rot.x, rot.y, rot.z);

        // B"H: Scale — numeric scalars handled by _getScaleVector
        if (this.scale !== undefined) {
            const s = this._getScaleVector(this.scale);
            this.mesh.scale.set(s.x, s.y, s.z);
        }

        this.mesh.updateMatrix();
        this.mesh.updateMatrixWorld(true);

        await olam.hoyseef(this);

        if (this.isSolid) this._createPhysicsProxy();

        this.isReady = true;
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────

    _getValidVector(v) {
        if (!v) return { x: 0, y: 0, z: 0 };
        if (typeof v.vector3 === 'function') return v.vector3();
        if (Array.isArray(v)) return { x: v[0] || 0, y: v[1] || 0, z: v[2] || 0 };
        return { x: v.x || 0, y: v.y || 0, z: v.z || 0 };
    }

    _getScaleVector(v) {
        if (typeof v === 'number') { const s = (isNaN(v) || v <= 0) ? 1 : v; return { x: s, y: s, z: s }; }
        if (!v) return { x: 1, y: 1, z: 1 };
        if (typeof v.vector3 === 'function') { const r = v.vector3(); return { x: r.x||1, y: r.y||1, z: r.z||1 }; }
        if (Array.isArray(v)) return { x: v[0]||1, y: v[1]||1, z: v[2]||1 };
        return { x: v.x||1, y: v.y||1, z: v.z||1 };
    }

    /**
     * @method _createPhysicsProxy
     * @description Simple cylinder physics proxy matching trunk dimensions.
     * Scale is NOT applied here — geometry is pre-sized to match the tree.
     */
    _createPhysicsProxy() {
        const scaleY = this.mesh?.scale?.y || 1;
        const h      = this._trunkH * scaleY;
        const r      = this._trunkR;

        const pg = this.createCylinderGeometry(r * 0.5, r, h, 8);
        if (!pg) return;
        pg.translate(0, h / 2, 0);

        const mat  = this.createMaterial('Basic', { visible: false });
        const proxy = this.createMesh(pg, mat);
        proxy.position.copy(this.mesh.position);
        proxy.userData = { isSolid: true };
        proxy.updateMatrix();
        proxy.updateMatrixWorld(true);

        if (this.olam?.worldOctree) {
            this.olam.worldOctree.addObject(proxy);
        }
    }

    heesHawvoos(dt) {
        if (!this.isReady) return;
        const p = this.olam?.chossid?.mesh?.position;
        if (this.olam?.materialGenerator) {
            if (this._barkMat) this.olam.materialGenerator._updateMat(this._barkMat, dt, p);
            if (this._leafMat) this.olam.materialGenerator._updateMat(this._leafMat, dt, p);
        }
    }
}
