
// B"H
/**
 * @file programManager.js
 * @brief The Automaton Compiler.
 */

import { compileShaderProgram } from '../../shaderCompiler.js';
import { registerShaderModule } from '../../shaders/utils/shaderModuleLoader.js';
import { GLSL_MODULES, SHADER_PROGRAMS } from './shaderRegistry.js';

export class ProgramManager {
    constructor(gl) {
        this.gl = gl;
        SHADER_PROGRAMS.forEach(prog => { this[prog.key] = null; });
    }

    /**
     * B"H - First, we register the modular fragments of light.
     */
    registerModules() {
        console.log(`B"H - ProgramManager: Registering ${GLSL_MODULES.length} GLSL modules...`);
        GLSL_MODULES.forEach(mod => registerShaderModule(mod.name, mod.source));
    }

    /**
     * B"H - Then, we weave the final programs.
     */
    init() {
        // B"H - CRITICAL: Register modules BEFORE initializing programs
        this.registerModules();
        
        let allSuccess = true;
        let compiledCount = 0;

        console.log(`B"H - ProgramManager: Mass compiling ${SHADER_PROGRAMS.length} programs...`);
        
        SHADER_PROGRAMS.forEach(({ key, vs, fs }) => {
            const progInfo = compileShaderProgram(this.gl, vs, fs);
            if (progInfo) {
                this[key] = progInfo;
                compiledCount++;
            } else {
                console.error(`B"H - FATAL COMPILATION: Failed to weave program [${key}].`);
                allSuccess = false;
            }
        });

        console.log(`B"H - ProgramManager: Done. Built ${compiledCount}/${SHADER_PROGRAMS.length} vessels.`);
        return allSuccess;
    }
}
