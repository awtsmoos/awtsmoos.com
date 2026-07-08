// B"H
/**
 * @file materialGenerator.js
 * @module MaterialGenerator
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE TZEVA (COLOR) — SUPREME MATERIAL GENERATOR (ULTRA-MODULAR)                  ║
 * ║                                                                                  ║
 * ║  Refactored to be entirely registry-driven.                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import { getFactory } from './materials/registry/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import getWindInjection from './materials/methods/wind.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    /** @type {Object} Cached materials for singleton reuse */
    _cache: new Map(),

    /**
     * @method get
     * @description Fetches a material from the registry and compiles it via Olam.
     */
    async get(type, olam) {
        this.olam = olam;
        
        // B"H Check cache first for singletons (like grass)
        if (type.includes('grass') && this._cache.has('grass')) {
            return this._cache.get('grass');
        }

        const factory = getFactory(type);
        if (!factory) {
            // B"H: Fallback to holy green light if the specific garment is missing
            return olam.createMaterial('Lambert', { color: 0x44aa44 });
        }

        const data = await factory(olam, type);
        const mat  = olam.createMaterial(data.type, data.properties, data.snippets);

        // B"H: Apply custom uniforms if the garment requires them
        if (data.customUniforms && mat.userData.shader) {
            this._applyUniforms(mat.userData.shader.uniforms, data.customUniforms);
        }

        if (type.includes('grass')) this._cache.set('grass', mat);
        
        return mat;
    },

    /**
     * @method bark
     */
    async bark(type) { return await this.get('bark', this.olam); },

    /**
     * @method leaf
     */
    async leaf(type) { return await this.get('leaf', this.olam); },

    /**
     * @method injectWind
     */
    injectWind(material) {
        if (!material || !this.olam?.materialManager) return;
        this.olam.materialManager.refine(material, getWindInjection());
    },

    /**
     * @method update
     */
    update(dt, playerPos) {
        this._cache.forEach(mat => this._updateMat(mat, dt, playerPos));
    },

    /**
     * @private _applyUniforms
     */
    _applyUniforms(target, source) {
        for (const key in source) {
            if (target[key]) {
                const val = source[key];
                if (target[key].value && typeof target[key].value.setRGB === 'function') {
                    target[key].value.setRGB(val.r, val.g, val.b);
                } else {
                    target[key].value = val;
                }
            }
        }
    },

    /**
     * @private _updateMat
     */
    _updateMat(mat, dt, playerPos) {
        if (mat && mat.userData?.shader) {
            const su = mat.userData.shader.uniforms;
            if (su.uTime) su.uTime.value += dt;
            if (playerPos && su.uPlayerPos) {
                const pv = su.uPlayerPos.value;
                if (pv && typeof pv.copy === 'function') pv.copy(playerPos);
                else if (pv) { pv.x = playerPos.x; pv.y = playerPos.y; pv.z = playerPos.z; }
            }
        }
    }
};
