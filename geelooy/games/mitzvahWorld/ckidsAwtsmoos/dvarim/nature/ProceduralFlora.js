// B"H

/**
 * @file ProceduralFlora.js
 * @module ProceduralFlora
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE REVELATION OF THE EARTH — Procedural Flora Manifestor                       ║
 * ║                                                                                  ║
 * ║  Chapter 18: The Blossoming of the Void                                          ║
 * ║                                                                                  ║
 * ║  "He causes the grass to grow for the cattle, and herb for the service          ║
 * ║   of man..." (Tehillim 104:14)                                                  ║
 * ║                                                                                  ║
 * ║  This vessel is a herald — it declares the INTENT to paint grass/flowers/rocks  ║
 * ║  at a position, and hands the actual work to the NatureSystem instance pool.    ║
 * ║                                                                                  ║
 * ║  B"H FIX: Now calls prewarm() before the paint loop, guaranteeing that all      ║
 * ║  paint() calls land on an initialized InstancedMesh pool rather than being       ║
 * ║  silently queued or dropped. The pool system handles deduplication.             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @extends Domem
 */
import Domem from '../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class ProceduralFlora extends Domem {
    type = 'proceduralFlora';

    /**
     * @constructor
     * @param {Object} op   - Options from emerald.js data
     * @param {Object} olam - World context
     */
    constructor(op, olam) {
        super(op, olam);
        this.floraType = op.floraType || 'grass';
        this.count     = op.count     || 20;
        this.radius    = op.radius    || 10;
        this.isSolid   = false;
    }

    /**
     * @method heescheel
     * @description
     * ════════════════════════════════════════════════════════════════════
     * THE SUMMONS OF CREATION — World Initialization
     * ════════════════════════════════════════════════════════════════════
     *
     * Step 1: Ensure NatureSystem singleton exists on the world.
     * Step 2: AWAIT prewarm() — this guarantees ALL InstancedMesh pools
     *         for this floraType are initialized before painting begins.
     *         Previously, paint() fired before pools resolved → silent loss.
     * Step 3: Paint each instance position into the now-ready pool.
     *
     * @param {Object} olam - World context
     */
    async heescheel(olam) {
        this.olam = olam;

        // B"H: Singleton NatureSystem
        if (!olam.natureSystem) {
            if (!olam._natureSystemLoading) {
                olam._natureSystemLoading = (async () => {
                    const { default: NatureSystem } = await import('./natureSystem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1');
                    olam.natureSystem = new NatureSystem(olam);
                })();
            }
            await olam._natureSystemLoading;
        }

        // B"H: AWAIT PREWARM — critical fix. Ensures pools exist before painting.
        // NatureSystem.prewarm() initializes all variants for this floraType
        // and returns a Promise that resolves when every pool is ready.
        await olam.natureSystem.prewarm(this.floraType);

        const p = this._getValidVector(this.position);

        // B"H: Now paint — every call is guaranteed to hit a live pool
        for (let i = 0; i < this.count; i++) {
            const offsetX = (Math.random() - 0.5) * this.radius * 2;
            const offsetZ = (Math.random() - 0.5) * this.radius * 2;
            olam.natureSystem.paint(this.floraType, {
                x: p.x + offsetX,
                y: p.y,
                z: p.z + offsetZ
            });
        }

        this.isReady = true;
    }

    /**
     * @method _getValidVector
     * @description
     * Resolves any vector-like input to a plain {x,y,z} object.
     * Handles Kav instances, arrays, and plain objects.
     *
     * @param {*} v - Raw vector input
     * @returns {{ x: number, y: number, z: number }}
     */
    _getValidVector(v) {
        if (!v) return { x: 0, y: 0, z: 0 };
        if (typeof v.vector3 === 'function') return v.vector3();
        if (Array.isArray(v)) return { x: v[0] || 0, y: v[1] || 0, z: v[2] || 0 };
        return { x: v.x || 0, y: v.y || 0, z: v.z || 0 };
    }
}
