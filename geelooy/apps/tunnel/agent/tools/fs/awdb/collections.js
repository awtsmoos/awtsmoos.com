// B"H
function plain(value) { return value && value.__resolve__ ? value.__resolve__() : JSON.parse(JSON.stringify(value ?? null)); }
function ensure(root, key, fallback = {}) { if (!root[key]) root[key] = fallback; return root[key]; }
function keys(obj) { return Object.keys(obj || {}); }
function values(obj) { return keys(obj).map(k => plain(obj[k])); }
function remove(obj, key) { try { delete obj[key]; return true; } catch { return false; } }
module.exports = { plain, ensure, keys, values, remove };
