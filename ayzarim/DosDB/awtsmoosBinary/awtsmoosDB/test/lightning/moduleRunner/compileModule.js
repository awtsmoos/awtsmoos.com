
// B"H

/**
 * @file test/lightning/moduleRunner/compileModule.js
 * @chapter The Compiler Chamber
 * @description
 * Compiles one transformed test module in-process.
 */

const Module = require('module');
const path = require('path');

/**
 * @function compileModule
 * @description Compiles a CommonJS module from source.
 * @param {string} scriptPath - Script path.
 * @param {string} code - Source code.
 * @returns {*} Module exports.
 */
function compileModule(scriptPath, code) {
  const mod = new Module(scriptPath, module.parent);

  mod.filename = scriptPath;
  mod.paths = Module._nodeModulePaths(path.dirname(scriptPath));

  delete require.cache[scriptPath];
  require.cache[scriptPath] = mod;

  mod._compile(code, scriptPath);
  return mod.exports;
}

module.exports = compileModule;
