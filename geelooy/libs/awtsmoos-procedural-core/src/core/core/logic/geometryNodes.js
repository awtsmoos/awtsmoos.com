
// B"H
/**
 * @file geometryNodes.js
 * @brief The Universal JSON Node Evaluator for Geometry and Selection.
 * 
 * THE REVELATION OF THE LIVING BRANCHES:
 * The string is a dead thing, parsed and forgotten,
 * But the Object is alive, by the Essence begotten!
 * We build the logic as trees, branches of pure data,
 * Flowing from the root, avoiding the errata.
 * With 'add' and 'mul', with 'sin' and with 'noise',
 * The geometry bends to the Awtsmoos's voice!
 * 
 * This engine allows entirely JSON-based visual scripting,
 * emulating Blender Geometry Nodes directly in the data structure!
 */

import { Vec3 } from '../math/vec3.js';

// Simple spatial noise for node evaluation
function hash(n) { return n - Math.floor(n); }
function simple3DNoise(p) {
    const n = Math.floor(p[0]) * 12.9898 + Math.floor(p[1]) * 78.233 + Math.floor(p[2]) * 37.719;
    return hash(Math.sin(n) * 43758.5453);
}

export class GeometryNodeEvaluator {
    /**
     * B"H - Recursively evaluates a JSON node tree against a local context (e.g., vertex data).
     * @param {any} node - The node to evaluate (Number, Array, or Object).
     * @param {object} ctx - The local context { pos: [x,y,z], norm: [x,y,z], uv: [u,v], etc. }.
     * @returns {number|Array|boolean} The resulting mathematical truth.
     */
    static evaluate(node, ctx) {
        // Base cases: Pure substance
        if (typeof node === 'number' || typeof node === 'boolean') return node;
        if (Array.isArray(node)) return node.map(n => this.evaluate(n, ctx));
        if (!node || typeof node !== 'object') return 0;

        // Variables: Pulling from the vessel of context
        if (node.var) {
            const parts = node.var.split('.');
            let val = ctx[parts[0]];
            if (parts.length > 1 && val !== undefined) {
                if (parts[1] === 'x' || parts[1] === 'r' || parts[1] === 'u') val = val[0];
                else if (parts[1] === 'y' || parts[1] === 'g' || parts[1] === 'v') val = val[1];
                else if (parts[1] === 'z' || parts[1] === 'b') val = val[2];
                else if (parts[1] === 'w' || parts[1] === 'a') val = val[3];
            }
            return val !== undefined ? val : 0;
        }

        // Recursive evaluation of branches
        const l = node.left !== undefined ? this.evaluate(node.left, ctx) : 0;
        const r = node.right !== undefined ? this.evaluate(node.right, ctx) : 0;
        const a = node.arg !== undefined ? this.evaluate(node.arg, ctx) : 0;

        // The Divine Operations
        switch(node.op) {
            // --- MATH ---
            case 'add': return this._op2(l, r, (a, b) => a + b);
            case 'sub': return this._op2(l, r, (a, b) => a - b);
            case 'mul': return this._op2(l, r, (a, b) => a * b);
            case 'div': return this._op2(l, r, (a, b) => b !== 0 ? a / b : 0);
            case 'mod': return this._op2(l, r, (a, b) => b !== 0 ? a % b : 0);
            case 'pow': return this._op2(l, r, (a, b) => Math.pow(a, b));
            case 'min': return this._op2(l, r, (a, b) => Math.min(a, b));
            case 'max': return this._op2(l, r, (a, b) => Math.max(a, b));
            
            // --- TRIGONOMETRY ---
            case 'sin': return this._op1(a, Math.sin);
            case 'cos': return this._op1(a, Math.cos);
            case 'abs': return this._op1(a, Math.abs);
            case 'fract': return this._op1(a, x => x - Math.floor(x));
            
            // --- VECTORS ---
            case 'vec3': return [
                this.evaluate(node.x, ctx), 
                this.evaluate(node.y, ctx), 
                this.evaluate(node.z, ctx)
            ];
            case 'dot': return Vec3.dot(this._toVec(l), this._toVec(r));
            case 'cross': return Vec3.cross(this._toVec(l), this._toVec(r));
            case 'length': return Math.sqrt(Vec3.dot(this._toVec(a), this._toVec(a)));
            case 'normalize': return Vec3.normalize(this._toVec(a));
            case 'distance': return Vec3.dist(this._toVec(l), this._toVec(r));
            case 'mix': 
                const t = this.evaluate(node.t, ctx);
                return this._op2(l, r, (A, B) => A + (B - A) * (typeof t === 'number' ? t : t[0] || 0));

            // --- LOGIC ---
            case 'gt': return l > r;
            case 'lt': return l < r;
            case 'eq': return l === r;
            case 'and': return l && r;
            case 'or': return l || r;
            case 'not': return !a;
            case 'if': return this.evaluate(node.cond, ctx) ? l : r;

            // --- NOISE ---
            case 'noise': return simple3DNoise(this._toVec(a));

            default: return 0;
        }
    }

    // Handlers for scalar vs vector operations
    static _op1(val, fn) {
        if (Array.isArray(val)) return val.map(v => fn(v));
        return fn(val);
    }

    static _op2(v1, v2, fn) {
        const isArr1 = Array.isArray(v1);
        const isArr2 = Array.isArray(v2);
        
        if (isArr1 && isArr2) {
            return [fn(v1[0]||0, v2[0]||0), fn(v1[1]||0, v2[1]||0), fn(v1[2]||0, v2[2]||0)];
        } else if (isArr1 && !isArr2) {
            return [fn(v1[0]||0, v2), fn(v1[1]||0, v2), fn(v1[2]||0, v2)];
        } else if (!isArr1 && isArr2) {
            return [fn(v1, v2[0]||0), fn(v1, v2[1]||0), fn(v1, v2[2]||0)];
        }
        return fn(v1, v2);
    }

    static _toVec(val) {
        if (Array.isArray(val)) return [val[0]||0, val[1]||0, val[2]||0];
        return [val, val, val];
    }
}
