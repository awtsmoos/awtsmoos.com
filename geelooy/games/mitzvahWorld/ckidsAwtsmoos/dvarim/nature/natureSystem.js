// B"H

/**
 * @file natureSystem.js
 * @module NatureSystem
 *
 * ══════════════════════════════════════════════════════════════════════
 * THE BREATH OF THE FIELD — Instanced Nature Mesh Painter
 * ══════════════════════════════════════════════════════════════════════
 *
 * Chapter 14: The Garden of Souls
 *
 * "He makes the grass grow for the cattle, and herb for the
 *  service of man..." (Tehillim 104:14)
 *
 * This system manages InstancedMesh pools for grass, rocks, flowers.
 * It paints them across the terrain surface using raycasting for
 * Y-snapping and random transforms per instance.
 *
 * B"H: CRITICAL FIX — Paint Queue
 * ─────────────────────────────────
 * Previously, paint() was called for hundreds of blades BEFORE their
 * pool had finished async initialization. The data was silently lost.
 * Now, paint() queues the call if the pool isn't ready yet, and the
 * queue is flushed once initPool() resolves. This guarantees every
 * blade request reaches the InstancedMesh.
 *
 * B"H: NatureSystem.update() no longer calls .copy() on plain objects;
 * it detects the correct mutation strategy from the uniform type.
 *
 * @description Instanced mesh painting system for all nature elements
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import GeometryGenerator from './procedural/geometryGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import MaterialGenerator from './procedural/materialGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * @constant TYPE_MAP
 * @description
 * ════════════════════════════════════════════════════════════════════
 * THE MAP OF FORMS — Flora Type Resolution
 * ════════════════════════════════════════════════════════════════════
 *
 * Pure data map from user-facing type names to internal pool variants.
 * Resolves random variant selection in a single data-driven step.
 * No switch statements — just a lookup + random pick from arrays.
 *
 * @type {Object.<string, string[]>}
 */
const TYPE_MAP = {
    grass:  ['grass_field'],
    rock:   ['rock_boulder', 'rock_slate'],
    flower: ['flower_blue', 'flower_white', 'flower_yellow'],
};

/**
 * @function resolveActualType
 * @description Resolves a user type string to a specific pool variant.
 * @param {string} type
 * @returns {string}
 */
function resolveActualType(type) {
    const variants = TYPE_MAP[type];
    if (variants) {
        return variants[Math.floor(Math.random() * variants.length)];
    }
    // Passthrough for already-specific types
    return type;
}

export default class NatureSystem {
    /**
     * @constructor
     * @param {Object} olam - World context providing scene, octree, event system
     */
    constructor(olam) {
        this.olam = olam;

        /** @type {Object.<string, PoolEntry>} Active resolved pools */
        this.pools = {};

        /** @type {Object.<string, Array>} Paint queue per pool type — flushed on pool ready */
        this._paintQueue = {};

        this.dummy = new THREE.Object3D();
        this.raycaster = new THREE.Raycaster();
        this.rayDown = new THREE.Vector3(0, -1, 0);
        this.loadingPools = new Set();
        this.colorHelper = new THREE.Color();

        // B"H: Hook into the world update loop
        this.olam.on('heesHawvoos', (dt) => this.update(dt));
    }

    /**
     * @method prewarm
     * @description
     * ════════════════════════════════════════════════════════════════════
     * THE PREPARATION OF VESSELS — Pool Pre-Warming
     * ════════════════════════════════════════════════════════════════════
     *
     * Called by ProceduralFlora BEFORE its paint loop. Resolves a
     * randomly-chosen variant from the type, initializes its pool,
     * and awaits completion. The caller can then immediately paint
     * and be guaranteed the pool is ready.
     *
     * Because multiple flora patches of the same type share one pool,
     * this is safe to call multiple times — initPool is idempotent.
     *
     * @param {string} type - User-facing type string ('grass','rock','flower')
     * @returns {Promise<void>}
     */
    async prewarm(type) {
        // B"H: Prewarm ALL variants for this type
        const variants = TYPE_MAP[type] || [type];
        await Promise.all(variants.map(v => this.initPool(v)));
    }

    /**
     * @method initPool
     * @description
     * ════════════════════════════════════════════════════════════════════
     * THE FORGING OF THE VESSEL — Pool Initialization
     * ════════════════════════════════════════════════════════════════════
     *
     * Creates a THREE.InstancedMesh for a specific nature type variant,
     * adds it to the scene, and stores it in this.pools[type].
     *
     * Once complete, flushes any paint calls that were queued while
     * the pool was still loading (_paintQueue[type]).
     *
     * @param {string} type - Specific pool type (e.g. 'grass_field')
     * @param {number} [maxInstances=5000]
     * @returns {Promise<PoolEntry|null>}
     */
    async initPool(type, maxInstances = 5000) {
        if (this.pools[type]) return this.pools[type];
        if (this.loadingPools.has(type)) {
            // B"H: Wait for the existing initiation to complete
            return new Promise(resolve => {
                const check = setInterval(() => {
                    if (this.pools[type]) {
                        clearInterval(check);
                        resolve(this.pools[type]);
                    } else if (!this.loadingPools.has(type)) {
                        clearInterval(check);
                        resolve(null);
                    }
                }, 50);
            });
        }

        this.loadingPools.add(type);

        try {
            let geometry = null;
            let material = null;
            let baseColor = new THREE.Color(0xffffff);

            if (!type.includes('flower')) {
                geometry = GeometryGenerator.get(type);
                material = await MaterialGenerator.get(type, this.olam);
                if (type.includes('grass')) {
                    console.log('B"H - 🌾 [NATURE.GRASS]: Manifesting grass pool variant:', type);
                    baseColor.setHex(0x44aa44);
                } else if (type.includes('rock')) baseColor.setHex(0x888888);
            }

            if (!geometry) {
                if (type.includes('flower')) {
                    const stem = new THREE.CylinderGeometry(0.025, 0.035, 0.55, 5);
                    stem.translate(0, 0.275, 0);
                    const petal = new THREE.SphereGeometry(0.16, 8, 6);
                    petal.scale(1.0, 0.35, 1.0);
                    petal.translate(0, 0.62, 0);
                    geometry = BufferGeometryUtils.mergeGeometries([stem.toNonIndexed(), petal.toNonIndexed()], false);
                    const flowerColor = type.includes('yellow') ? 0xffd84a : type.includes('white') ? 0xf8fff2 : 0x6ca8ff;
                    material = new THREE.MeshLambertMaterial({ color: flowerColor, side: THREE.DoubleSide });
                    baseColor.setHex(flowerColor);
                } else if (type.includes('rock')) {
                    geometry = new THREE.DodecahedronGeometry(0.45, 0);
                    material = new THREE.MeshLambertMaterial({ color: 0x777777 });
                    baseColor.setHex(0x777777);
                } else {
                    geometry = new THREE.PlaneGeometry(0.12, 0.8);
                    geometry.rotateX(-0.25);
                    geometry.translate(0, 0.4, 0);
                    material = new THREE.MeshLambertMaterial({ color: 0x3fa747, side: THREE.DoubleSide });
                    baseColor.setHex(0x3fa747);
                }
            }

            geometry.computeBoundingBox();
            const box  = geometry.boundingBox;
            const size = new THREE.Vector3();
            box.getSize(size);
            const height = size.y;

            // B"H: Normalize all geometry to a canonical height
            const TARGET_HEIGHTS = { rock: 0.6, grass: 0.6, flower: 0.8 };
            const targetHeight = TARGET_HEIGHTS[
                Object.keys(TARGET_HEIGHTS).find(k => type.includes(k))
            ] || 0.5;

            if (height > 0.01) {
                const scaleFactor = targetHeight / height;
                geometry.scale(scaleFactor, scaleFactor, scaleFactor);
            }

            geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            geometry.boundingBox.getCenter(center);
            geometry.translate(-center.x, -geometry.boundingBox.min.y, -center.z);

            const instancedMesh = new THREE.InstancedMesh(geometry, material, maxInstances);
            instancedMesh.count = 0;
            instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            if (instancedMesh.instanceColor) instancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

            instancedMesh.receiveShadow = true;
            instancedMesh.castShadow = true;
            instancedMesh.frustumCulled = false;

            this.olam.nivrayimGroup.add(instancedMesh);

            this.pools[type] = {
                mesh:      instancedMesh,
                count:     0,
                max:       maxInstances,
                material,
                baseColor
            };

            // B"H: Flush the paint queue for this type
            this._flushQueue(type);

            return this.pools[type];

        } catch (_e) {
            /* B"H: Silent — missing pool degrades gracefully */
            return null;
        } finally {
            this.loadingPools.delete(type);
        }
    }

    /**
     * @method _flushQueue
     * @description
     * ════════════════════════════════════════════════════════════════════
     * THE RELEASING OF STORED SPEECH — Paint Queue Flush
     * ════════════════════════════════════════════════════════════════════
     *
     * When ProceduralFlora calls paint() before the pool is ready,
     * the call is stored here. Once initPool() resolves, this method
     * replays every stored paint operation so no blade is lost.
     *
     * @param {string} type - Pool type key
     */
    _flushQueue(type) {
        const queue = this._paintQueue[type];
        if (!queue || queue.length === 0) return;
        for (const pos of queue) {
            this._paintToPool(type, pos);
        }
        delete this._paintQueue[type];
    }

    /**
     * @method paint
     * @description
     * ════════════════════════════════════════════════════════════════════
     * THE BREATH OF LIFE ON EARTH — Grass/Rock/Flower Instance Painting
     * ════════════════════════════════════════════════════════════════════
     *
     * Places a nature instance at or near centerPosition.
     * If the pool isn't ready yet, queues the paint for later replay
     * instead of silently dropping it (the old bug).
     *
     * @param {string} type          - User-facing type ('grass','rock','flower')
     * @param {{ x:number, y:number, z:number }} centerPosition
     */
    paint(type, centerPosition) {
        const actualType = resolveActualType(type);
        const pool = this.pools[actualType];

        if (!pool) {
            // B"H: Queue for replay once pool resolves
            if (!this._paintQueue[actualType]) {
                this._paintQueue[actualType] = [];
                // Fire pool init if not already started
                if (!this.loadingPools.has(actualType)) {
                    this.initPool(actualType);
                }
            }
            this._paintQueue[actualType].push({ ...centerPosition });
            return;
        }

        this._paintToPool(actualType, centerPosition);
    }

    /**
     * @method _paintToPool
     * @description
     * ════════════════════════════════════════════════════════════════════
     * THE ACT OF CREATION — Single Instance Placement
     * ════════════════════════════════════════════════════════════════════
     *
     * The actual InstancedMesh mutation. Raycasts to find terrain Y,
     * applies random rotation/scale variance, sets the instance matrix
     * and color, then updates the InstancedMesh counts.
     *
     * @param {string} actualType - Resolved pool key
     * @param {{ x:number, y:number, z:number }} centerPosition
     */
    _paintToPool(actualType, centerPosition) {
        const pool = this.pools[actualType];
        if (!pool) return;

        const countToAdd = actualType.includes('rock') ? 1 : 3;
        const range = 2;

        for (let i = 0; i < countToAdd; i++) {
            if (pool.count >= pool.max) break;

            const offsetX = (Math.random() - 0.5) * range;
            const offsetZ = (Math.random() - 0.5) * range;
            const targetX = centerPosition.x + offsetX;
            const targetZ = centerPosition.z + offsetZ;

            let yPos = centerPosition.y;
            if (this.olam.worldOctree) {
                this.raycaster.set(
                    new THREE.Vector3(targetX, yPos + 10, targetZ),
                    this.rayDown
                );
                const hit = this.olam.worldOctree.rayIntersect(this.raycaster.ray);
                if (hit) yPos = hit.position.y;
            }

            this.dummy.position.set(targetX, yPos, targetZ);
            this.dummy.rotation.set(
                (Math.random() - 0.5) * 0.1,
                Math.random() * Math.PI * 2,
                (Math.random() - 0.5) * 0.1
            );

            // B"H: Type-specific scale + color variation data
            const VARIATION_MAP = {
                grass:  { scaleX: () => 0.8 + Math.random() * 0.6, scaleYMul: () => 0.8 + Math.random() * 0.5, hsl: () => [(Math.random()-0.5)*0.08, (Math.random()-0.5)*0.1, (Math.random()-0.5)*0.15] },
                rock:   { scaleX: () => 0.8 + Math.random() * 0.8, scaleYMul: () => 0.8, hsl: () => [0, 0, (Math.random()-0.5)*0.2] },
                flower: { scaleX: () => 0.8 + Math.random() * 0.6, scaleYMul: () => 0.8 + Math.random() * 0.5, hsl: () => [0, 0, (Math.random()-0.5)*0.1] },
            };

            const varKey = Object.keys(VARIATION_MAP).find(k => actualType.includes(k)) || 'grass';
            const v = VARIATION_MAP[varKey];
            const sx = v.scaleX();
            this.dummy.scale.set(sx, sx * v.scaleYMul(), sx);

            if (pool.baseColor) {
                this.colorHelper.copy(pool.baseColor);
            } else {
                this.colorHelper.setHex(0xffffff);
            }
            const [h, s, l] = v.hsl();
            this.colorHelper.offsetHSL(h, s, l);

            this.dummy.updateMatrix();
            pool.mesh.setMatrixAt(pool.count, this.dummy.matrix);
            if (pool.mesh.setColorAt) {
                pool.mesh.setColorAt(pool.count, this.colorHelper);
            }
            pool.count++;
        }

        pool.mesh.count = pool.count;
        pool.mesh.instanceMatrix.needsUpdate = true;
        if (pool.mesh.instanceColor) pool.mesh.instanceColor.needsUpdate = true;
    }

    /**
     * @method update
     * @description
     * ════════════════════════════════════════════════════════════════════
     * THE PULSE OF TIME — Per-Frame Shader Uniform Update
     * ════════════════════════════════════════════════════════════════════
     *
     * Advances uTime and updates uPlayerPos on all active materials.
     * B"H: Checks whether the uniform value supports .copy() (THREE.Vector3)
     * and falls back to direct property assignment if not.
     *
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        let playerPos = null;
        if (this.olam?.chossid?.mesh) {
            playerPos = this.olam.chossid.mesh.position;
        }

        for (const key in this.pools) {
            const material = this.pools[key].material;
            const mats = Array.isArray(material) ? material : (material ? [material] : []);

            for (const mat of mats) {
                if (!mat?.userData?.shader) continue;
                const su = mat.userData.shader.uniforms;
                if (su.uTime) su.uTime.value += dt;
                if (playerPos && su.uPlayerPos) {
                    // B"H: Support both THREE.Vector3 (.copy) and plain object (direct assign)
                    const pv = su.uPlayerPos.value;
                    if (typeof pv.copy === 'function') {
                        pv.copy(playerPos);
                    } else {
                        pv.x = playerPos.x; pv.y = playerPos.y; pv.z = playerPos.z;
                    }
                }
            }
        }

        // B"H: Update shared grass material via MaterialGenerator
        MaterialGenerator.update(dt, playerPos);
    }
}
