// B"H

/**
 * Chapter 23: The Data-URL Exile Received a Sky.
 *
 * Some old UMD vessels expect `this` to be the global root. ES modules inside
 * data URLs give them no such sky, so this adapter rewrites only that brittle
 * root expression into `globalThis`, letting Merkava's browser/node bridges
 * survive the tunnel import path without changing their public shape.
 *
 * @param {string} source JavaScript module text fetched over HTTP.
 * @param {string} url Original module URL, used for narrow targeting.
 * @returns {string} Source safe for data-url module import.
 */
function stabilizeRemoteModuleSource(source, url = "") {
  let next = String(source || "");
  if (/MerkavaExecutor\//.test(url)) {
    next = next.replace(/typeof self !== 'undefined' \? self : this/g, "typeof self !== 'undefined' ? self : globalThis");
    next = next.replace(/const\s+\{\s*([^}]+)\s*\}\s*=\s*require\(["'](\.{1,2}\/[^"']+)["']\);/g, "import { $1 } from \"$2\";");
    next = next.replace(/\nmodule\.exports\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\};?\s*$/m, "\nexport { $1 };\n");
    if (/\(function\(root, factory\)/.test(next) && !/export\s+default/.test(next)) {
      next += "\nexport default globalThis.Merkava || {};\n";
    }
    if (/\(function\(root, factory\)/.test(next) && !/export\s+default/.test(next)) {
      next += "\nexport default globalThis.Merkava || {};\n";
    }
  }
  return next;
}

module.exports = { stabilizeRemoteModuleSource };
