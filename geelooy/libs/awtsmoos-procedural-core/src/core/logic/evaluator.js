
// B"H
/**
 * @file evaluator.js
 * @brief The divine interpreter for the logical modifier system.
 * 
 * THE HYMN OF THE PRESERVED NODE:
 * Not every variable belongs to the global state,
 * Some are local seeds, lying in wait!
 * If the Context knows not the name of the spark,
 * We leave it untouched, glowing in the dark.
 * So when the Node Tree arrives at the point,
 * It finds its own variables, ready to anoint!
 * The "mul" and the "sin" shall no longer fail,
 * As the breath of the Creator fills every sail.
 */
import { applySingleModifier } from '../geometry/modifiers/router.js';
import { LOGIC_OPERATOR_REGISTRY } from './operators/index.js';
import { queryFaces } from '../geometry/selection/faceQuery.js';
import { queryVertices } from '../geometry/selection/vertexQuery.js';

export class ModifierEvaluator {
    /**
     * @brief Evaluates a single modifier or macro block.
     */
    evaluate(mesh, mod, context) {
        if (!mod || !mod.type) return mesh;

        // 1. Recursive Macro Loop
        if (mod.type === 'loop' || mod.type === 'LOOP') {
            const iterations = mod.iterations || mod.count || 1;
            const subMods = mod.modifiers || [];
            let currentMesh = mesh;
            for (let i = 0; i < iterations; i++) {
                for (const subMod of subMods) {
                    currentMesh = this.evaluate(currentMesh, subMod, context);
                }
            }
            return currentMesh;
        }

        // 2. Standard Modifier Execution
        try {
            // B"H - Resolve parameters before execution
            const resolvedParams = this._resolveParams(mod.params, context);
            const resolvedMod = { ...mod, params: resolvedParams };

            const logicalHandler = LOGIC_OPERATOR_REGISTRY[mod.type];
            if (logicalHandler) {
                return logicalHandler(mesh, resolvedParams, context, this);
            } else {
                return applySingleModifier(mesh, resolvedMod, context.objectData);
            }
        } catch (err) {
            console.error(`B"H - 🚨 [Evaluator]: Modifier [${mod.type}] shattered the vessel!`, err);
            return mesh; 
        }
    }

    /**
     * @brief Recursively maps context variables into the parameter structure.
     * @private
     */
    _resolveParams(params, context) {
        if (params === undefined || params === null) return params;
        if (typeof params !== 'object') return params;

        if (Array.isArray(params)) {
            return params.map(item => this._resolveParams(item, context));
        }

        const resolved = {};
        for (const key in params) {
            const value = params[key];
            
            // Check for variable reference { var: "name" }
            if (value && typeof value === 'object' && !Array.isArray(value) && value.var) {
                // B"H - THE TIKKUN OF THE LOCAL VARIABLE:
                // We attempt a SILENT get. If the variable is not in the context,
                // we return the original object instead of null. This allows
                // systems like NodeSculpt to resolve 'pos.y' or 'norm' themselves.
                const contextVal = context.get(value.var, true); 
                resolved[key] = (contextVal !== null) ? contextVal : value;
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
