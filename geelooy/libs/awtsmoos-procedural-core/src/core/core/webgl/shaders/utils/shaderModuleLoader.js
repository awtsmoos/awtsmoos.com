
// B"H
/**
 * @file shaderModuleLoader.js
 * @brief The Divine Scribe of GLSL. It gathers the scattered scrolls of shader logic
 *        and weaves them into a single, perfect text for the compiler.
 */

const MODULE_REGISTRY = new Map();

export function registerShaderModule(name, source) {
    if (MODULE_REGISTRY.has(name)) return; // Avoid redundant registration
    MODULE_REGISTRY.set(name, source);
}

export function loadShaderSource(source) {
    const includeRegex = /#include <([a-zA-Z0-9_]+)>/g;

    // B"H - Recursive expansion to handle includes within includes
    const expand = (src) => {
        return src.replace(includeRegex, (match, moduleName) => {
            if (MODULE_REGISTRY.has(moduleName)) {
                return expand(MODULE_REGISTRY.get(moduleName));
            } else {
                console.error(`B"H - Shader Scribe Error: Unknown module '${moduleName}'.`);
                return `// ERROR: Module '${moduleName}' not found.`;
            }
        });
    };

    return expand(source);
}
