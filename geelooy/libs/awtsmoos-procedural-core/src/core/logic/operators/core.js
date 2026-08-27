
// B"H
/**
 * @file core.js
 * @brief The foundational commands of the modifier logic engine.
 */

export const LOGIC_CORE_OPERATORS = {
    /**
     * @brief Stores a value or the result of a query in the context.
     * @param {object} params { name: string, value: any | { query: {...} } }
     */
    'set_var': (mesh, params, context, evaluator) => {
        const { name, value } = params;
        if (!name) return mesh;

        if (value && typeof value === 'object' && value.query) {
            if (value.query.face) {
                context.set(name, evaluator.queryFaces(mesh, value.query.face, context));
            } else if (value.query.vertex) {
                context.set(name, evaluator.queryVertices(mesh, value.query.vertex, context));
            }
        } else {
            context.set(name, value);
        }
        return mesh;
    },

    'log': (mesh, params, context) => {
        let output = params.message || '';
        if (params.var) {
            const val = context.get(params.var);
            const valStr = val instanceof Set ? `Set(${val.size} items)` : Array.isArray(val) ? `Array(${val.length} items)` : JSON.stringify(val);
            output += ` | VAR['${params.var}'] = ${valStr}`;
        }
        console.log(`B"H - MODIFIER LOG: ${output}`);
        return mesh;
    }
};
