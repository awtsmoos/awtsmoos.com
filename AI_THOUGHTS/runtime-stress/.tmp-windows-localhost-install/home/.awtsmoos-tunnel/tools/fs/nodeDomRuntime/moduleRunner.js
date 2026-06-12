// B"H
const vm = require("vm");
const { transformModule } = require("./moduleTransform.js");
const { resolveImport } = require("./importMap.js");
const { cleanKey, virtualUrl, publicCandidates } = require("./publicPath.js");
const { fetchPublicModule } = require("./publicFetch.js");
const { shimFor } = require("./shims/index.js");

/** B"H: executes transformed modules in the same Node VM context. */
function createModuleRunner(context, files, imports, options = {}) {
  const cache = new Map();
  async function load(spec, from = "") {
    const key = cleanKey(resolveImport(spec, from, imports));
    if (cache.has(key)) return cache.get(key);
    const source = await fileBody(files, key, options, spec);
    if (source == null) throw new Error("Missing module: " + spec + " resolved to " + key);
    const exports = {};
    cache.set(key, exports);
    const wrapped = await transformModule(source, virtualUrl(key, options.origin || options.url));
    const fn = vm.runInContext(wrapped, context, { filename: key });
    await fn(exports, child => load(child, key));
    return exports;
  }
  return { load };
}

async function fileBody(files, key, options = {}, rawSpec = key) {
  const shim = shimFor(rawSpec) || shimFor(key);
  if (shim) return shim;
  for (const candidate of publicCandidates(key)) if (files[candidate] != null) return files[candidate];
  const fetched = await fetchPublicModule(key, options);
  if (fetched != null) { files[cleanKey(key)] = fetched; return fetched; }
  return null;
}
module.exports = { createModuleRunner, fileBody };
