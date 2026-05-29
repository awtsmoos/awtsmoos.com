// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js';
let text = fs.readFileSync(file, 'utf8');
const oldText = `return (async () => {
                if (!href) throw new Error('Dynamic import received an empty module specifier.');
                if (cache.has(href)) return cache.get(href);
                const env = await collectDynamicModuleEnv(href, pageUrl, seedFiles, graph, options);
                const result = await runModuleFile({ files: env.files, entry: env.entry, globals, runtime: 'browser', graph });
                if (result?.exports) cache.set(href, result.exports);
                return result?.exports || {};
            })();`;
const newText = `const promise = (async () => {
                if (!href) throw new Error('Dynamic import received an empty module specifier.');
                if (cache.has(href)) return cache.get(href);
                const env = await collectDynamicModuleEnv(href, pageUrl, seedFiles, graph, options);
                const result = await runModuleFile({ files: env.files, entry: env.entry, globals, runtime: 'browser', graph });
                if (result?.exports) cache.set(href, result.exports);
                return result?.exports || {};
            })();
            const safe = promise.catch(error => {
                runtime.errors = runtime.errors || [];
                runtime.errors.push({ message: error.message, stack: error.stack || '', code: error.code || null, trace: error.trace || null, phase: 'dynamicImport', href });
                return {};
            });
            safe.then = function(onFulfilled, onRejected) {
                return promise.then(value => {
                    try { return typeof onFulfilled === 'function' ? onFulfilled(value) : value; }
                    catch (error) {
                        runtime.errors = runtime.errors || [];
                        runtime.errors.push({ message: error.message, stack: error.stack || '', code: error.code || null, trace: error.trace || null, phase: 'dynamicImport.then', href });
                        return {};
                    }
                }, error => {
                    runtime.errors = runtime.errors || [];
                    runtime.errors.push({ message: error.message, stack: error.stack || '', code: error.code || null, trace: error.trace || null, phase: 'dynamicImport.reject', href });
                    return typeof onRejected === 'function' ? onRejected(error) : {};
                });
            };
            return safe;`;
if (!text.includes(oldText)) throw new Error('dynamic import block not found');
text = text.replace(oldText, newText);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, patched: text.includes('dynamicImport.then') }, null, 2));
