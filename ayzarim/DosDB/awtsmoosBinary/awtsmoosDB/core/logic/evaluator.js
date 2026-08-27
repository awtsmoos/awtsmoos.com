
// B"H
/**
 * @file evaluator.js
 * @brief The divine interpreter for the logical modifier system.
 * 
 * THE HYMN OF THE PRESERVED PRIMITIVE:
 * The array is a vessel, holding numbers in a line,
 * We must not warp the digits, they are sacred and divine.
 * If a zero sits within, we let the zero stay,
 * So the normal vectors function in the proper, holy way!
 */
import { applySingleModifier } from '../geometry/modifiers/router.js';
import { LOGIC_OPERATOR_REGISTRY } from './operators/index.js';
import { queryFaces } from '../geometry/selection/faceQuery.js';
import { queryVertices } from '../geometry/selection/vertexQuery.js';

export class ModifierEvaluator {
    evaluate(mesh, mod, context) {
        if (!mod || !mod.type) return mesh;

        if (mod.type === 'loop') {
            const iterations = mod.iterations || mod.count || 1;
            const subMods = mod.modifiers || [];
            let currentMesh = mesh;
            console.log(`B"H - 🔄 Evaluator: Entering macro loop for ${iterations} iterations.`);
            for (let i = 0; i < iterations; i++) {
                for (const subMod of subMods) {
                    currentMesh = this.evaluate(currentMesh, subMod, context);
                }
            }
            return currentMesh;
        }

        try {
            const resolvedParams = this._resolveParams(mod.params, context);
            const resolvedMod = { ...mod, params: resolvedParams };

            const logicalHandler = LOGIC_OPERATOR_REGISTRY[mod.type];
            if (logicalHandler) {
                return logicalHandler(mesh, resolvedParams, context, this);
            } else {
                return applySingleModifier(mesh, resolvedMod, context.objectData);
            }
        } catch (err) {
            console.error(`\nB"H - 🚨🚨🚨 INSANE FATAL ERROR IN EVALUATOR! 🚨🚨🚨`);
            console.error(`B"H - The modifier [${mod.type}] shattered the vessel!`);
            console.error(`B"H - 📜 Modifier Data:`, JSON.stringify(mod));
            console.error(`B"H - 🔥 Error Stack:`, err);
            console.error(`B"H - 🚨🚨🚨 ======================================= 🚨🚨🚨\n`);
            return mesh; // Return surviving geometry to prevent total engine death
        }
    }

    _resolveParams(params, context) {
        // B"H - THE TIKKUN OF ZERO: 0 is falsy, but it is a valid coordinate!
        if (params === undefined || params === null) return params;
        if (typeof params !== 'object') return params; // Numbers, Strings, and Booleans pass safely!

        // B"H - Pure Array Preservation without mutation bugs
        if (Array.isArray(params)) {
            const arr = [];
            for (let i = 0; i < params.length; i++) {
                const val = params[i];
                if (val !== null && typeof val === 'object') {
                    arr.push(this._resolveParams(val, context));
                } else {
                    arr.push(val); // Preserves 0, -1, etc. perfectly.
                }
            }
            return arr;
        }

        const resolved = {};
        for (const key in params) {
            const value = params[key];
            if (value && typeof value === 'object' && !Array.isArray(value) && value.var) {
                resolved[key] = context.get(value.var);
            } else if (value && typeof value === 'object') {
                resolved[key] = this._resolveParams(value, context);
            } else {
                resolved[key] = value;
            }
        }
        return resolved;
    }
    
    queryFaces(mesh, query, context) {
        const resolvedQuery = this._resolveParams(query, context);
        return queryFaces(mesh, resolvedQuery);
    }
    
    queryVertices(mesh, query, context) {
        const resolvedQuery = this._resolveParams(query, context);
        return queryVertices(mesh, resolvedQuery);
    }
}
