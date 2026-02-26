
// B"H
/**
 * @file executor.js
 * @brief ABSOLUTE DRIVER MODULE.
 * Accepts modules mapped by Dispatcher and activates them flawlessly despite arbitrary JS wrappers.
 */

export const ActionExecutor = {
    /**
     * @param {any} actionDef The pure ES-loaded code logic chunk.
     * @param {object} context Invocation origins metadata.
     * @param {string} debugName Hardcoded tag label passed strictly for console analytics clarity.
     */
    async execute(actionDef, context, debugName = 'N/A') {
        try {
            // Penetrate outer generic async promise wraps directly to reveal synchronous reality definitions
            let coreDef = (actionDef instanceof Promise) ? await actionDef : actionDef;

            // Absolute lack of function structure fails logic chain early
            if (!coreDef) {
                console.error(`B"H - Code Manifest Error. Action target module defined as Void null -> ${debugName}`, context);
                return;
            }
            
            // Decoupling strategy depending entirely upon script formatting norms inside command JS blocks.
            if (typeof coreDef === 'function') {
                return await coreDef(context);
            } 
            else if (typeof coreDef.run === 'function') {
                return await coreDef.run(context);
            } 
            else if (typeof coreDef.execute === 'function') {
                return await coreDef.execute(context);
            }
            else if (coreDef.default && typeof coreDef.default === 'function') {
                return await coreDef.default(context);
            }
            // Extreme heuristic execution check - takes any primary function defined via default logic properties structure 
            else if (coreDef.default && typeof coreDef.default.run === 'function') {
                 return await coreDef.default.run(context);
            }
            else {
                console.error(`B"H - Logic Structure Abort [${debugName}]: Action mapping possesses no standard JS execution interfaces.`, { definition: coreDef });
            }
        } catch (e) {
            console.error(`B"H - Runtime logic evaluation Exception processing instruction request payload [${debugName}]:`, e);
        }
    }
};
