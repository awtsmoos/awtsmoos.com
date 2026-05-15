
// B"H
/**
 * @file conditional.js
 * @brief The 'if' statement for the modifier system.
 */

export const LOGIC_CONDITIONAL_OPERATORS = {
    /**
     * @brief Executes a block of modifiers based on a condition.
     * @param {object} params { condition: {...}, then: [...modifiers], else: [...modifiers] }
     */
    'if': (mesh, params, context, evaluator) => {
        const { condition, then: then_block, else: else_block } = params;
        if (!condition || !then_block) return mesh;
        
        let conditionMet = false;
        const op = Object.keys(condition)[0];
        const c_params = condition[op];

        switch(op) {
            case 'query_result_count':
                const query = c_params.query;
                const result = query.face 
                    ? evaluator.queryFaces(mesh, query.face, context) 
                    : evaluator.queryVertices(mesh, query.vertex, context);

                const count = Array.isArray(result) ? result.length : result.size;
                
                if (c_params.gt !== undefined && count > c_params.gt) conditionMet = true;
                if (c_params.lt !== undefined && count < c_params.lt) conditionMet = true;
                if (c_params.eq !== undefined && count === c_params.eq) conditionMet = true;
                break;
            
            case 'var_equals':
                const val = context.get(c_params.name);
                if (val === c_params.value) conditionMet = true;
                break;
        }

        let currentMesh = mesh;
        if (conditionMet) {
            console.log("B\"H - Conditional: 'then' branch taken.");
            for (const mod of then_block) {
                currentMesh = evaluator.evaluate(currentMesh, mod, context);
            }
        } else if (else_block) {
            console.log("B\"H - Conditional: 'else' branch taken.");
            for (const mod of else_block) {
                currentMesh = evaluator.evaluate(currentMesh, mod, context);
            }
        } else {
             console.log("B\"H - Conditional: Condition false, no 'else' block.");
        }

        return currentMesh;
    }
};
