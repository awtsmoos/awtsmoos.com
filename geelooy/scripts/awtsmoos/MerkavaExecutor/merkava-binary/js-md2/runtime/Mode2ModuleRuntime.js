// B"H
'use strict';

/**
 * Chapter 10: The Awtsmoos gathers modules into one sealed breath.
 *
 * The current MD2 module graph path is intentionally small: each provided
 * source is transformed into CommonJS-shaped assignments, concatenated into one
 * direct JavaScript source, then compiled by the MD2 JS compiler. This sidecar
 * preserves that narrow surface while making future import-graph work possible
 * without swelling the binary executor again.
 */
class Mode2ModuleRuntime {
  /**
   * Rewrites the present tiny ESM/CommonJS export surface into local variables.
   *
   * @param {string} source Module source text.
   * @param {string} moduleVar Generated module variable name.
   * @param {string} exportsVar Generated exports variable name.
   * @returns {string} Rewritten source text.
   */
  transformCjsModule(source, moduleVar, exportsVar) {
    return String(source)
      .replace(/export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g, (_, name, expr) => `${exportsVar}.${name} = ${expr};`)
      .replace(/export\s+let\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g, (_, name, expr) => `${exportsVar}.${name} = ${expr};`)
      .replace(/export\s+function\s+([A-Za-z_$][\w$]*)\s*\(/g, (_, name) => `${exportsVar}.${name} = function(`)
      .replace(/module\.exports\s*=\s*/g, `${moduleVar}.exports = `)
      .replace(/exports\.([A-Za-z_$][\w$]*)\s*=\s*/g, `${exportsVar}.$1 = `);
  }

  /**
   * Builds one unified source string from an ordered module list and main file.
   *
   * @param {string} main Main module source.
   * @param {Array<string>} orderedFiles Module ids in execution order.
   * @param {(file:string)=>string} readSource Resolver returning source text.
   * @returns {string} Unified source ready for MD2 JS compilation.
   */
  buildUnifiedSource(main, orderedFiles, readSource) {
    const pieces = ['let __md2_modules = {}; let __md2_require = function(id){ return __md2_modules[id]; };'];
    orderedFiles.forEach((file, index) => {
      const moduleVar = `__md2_module_${index}`;
      const exportsVar = `__md2_exports_${index}`;
      const body = this.transformCjsModule(readSource(file), moduleVar, exportsVar);
      pieces.push(`let ${moduleVar} = {exports:{}}; let ${exportsVar} = ${moduleVar}.exports; ${body}; __md2_modules[${JSON.stringify(file)}] = ${moduleVar}.exports;`);
    });
    pieces.push(`let __md2_module_main = {exports:{}}; let __md2_exports_main = __md2_module_main.exports; ${main};`);
    return pieces.join('\n');
  }
}

const mode2ModuleRuntime = new Mode2ModuleRuntime();

module.exports = { Mode2ModuleRuntime, mode2ModuleRuntime };
