// B"H
const vm = require("vm");
const path = require("path");
const { createModuleRunner } = require("./moduleRunner.js");
const { mergeImportMaps } = require("./importMap.js");
const { installNamedElements } = require("./vmContext.js");
const { cleanKey } = require("./publicPath.js");

/** Runs browser scripts with Node's JS engine while DOM remains Merkava. */
async function runScripts({ context, plan, files, errors, options = {} }) {
  installNamedElements(context);
  const modules = createModuleRunner(context, files, mergeImportMaps(plan), { ...options, allowUrlFetch: options.allowUrlFetch !== false });
  let inlineIndex = 0;
  for (const step of plan.executionPlan || []) {
    try {
      const code = step.inline ? step.code : files[step.resolved] || files[String(step.resolved || "").replace(/^\//, "")] || "";
      if (step.type === "module" || /\bimport\s|\bexport\s|import\.meta/.test(code)) await runModuleStep(modules, step, code, files, ++inlineIndex);
      else runClassic(context, code, step.resolved || step.from || "inline-script.js");
      installNamedElements(context);
    } catch (error) {
      errors.push({ message: error.message, stack: error.stack, phase: "script", file: step.resolved || step.from || null });
    }
  }
}
function runClassic(context, code, filename) { vm.runInContext(String(code || ""), context, { filename: filename || "classic-script.js" }); }
async function runModuleStep(modules, step, code, files, index) {
  const base = path.posix.dirname((step.from || step.resolved || "index.html").replace(/\\/g, "/"));
  const key = cleanKey(step.resolved || `${base}/__inline_module_${index}.js`);
  files[key] = code;
  await modules.load(key, step.from || step.resolved || "");
}
module.exports = { runScripts, runClassic, runModuleStep };
