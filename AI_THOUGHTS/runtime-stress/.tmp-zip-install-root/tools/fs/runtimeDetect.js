// B"H

const fs = require('fs');
const path = require('path');

function exists(p) {
    try { return fs.existsSync(p); } catch (e) { return false; }
}

function readJson(p) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

function detectRuntime(root) {
    const pkgPath = path.join(root, 'package.json');
    const pkg = exists(pkgPath) ? readJson(pkgPath) : null;

    if (pkg?.dependencies?.vite || pkg?.devDependencies?.vite) {
        return { kind: 'frontend', type: 'vite', port: 5173 };
    }

    if (pkg?.dependencies?.next || pkg?.devDependencies?.next) {
        return { kind: 'fullstack', type: 'next', port: 3000 };
    }

    if (exists(path.join(root, 'index.html'))) {
        return { kind: 'static', type: 'html', port: null };
    }

    if (exists(path.join(root, 'server.js')) || exists(path.join(root, 'index.js'))) {
        return { kind: 'backend', type: 'node', port: 3000 };
    }

    return { kind: 'unknown', type: 'unknown', port: null };
}

module.exports = { detectRuntime };
