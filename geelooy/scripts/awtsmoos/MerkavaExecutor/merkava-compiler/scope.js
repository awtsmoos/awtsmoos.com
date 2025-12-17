
// B"H
(function(root) {
    // B"H - Robust Global Resolution
    let globalScope = root;
    if (typeof globalThis !== 'undefined') globalScope = globalThis;
    else if (typeof self !== 'undefined') globalScope = self;
    else if (typeof window !== 'undefined') globalScope = window;

    globalScope.MerkavaCompiler = globalScope.MerkavaCompiler || {};

    console.log("[MerkavaCompiler] Initializing Scope Module...");

    class CompilerScope {
        constructor(parent = null, isFunctionBoundary = false) {
            this.parent = parent;
            this.locals = new Map();
            this.isFunctionBoundary = isFunctionBoundary;

            if (isFunctionBoundary) {
                this.stackIndex = 0;
                this.depth = parent ? parent.depth + 1 : 0;
            } else {
                this.stackIndex = parent ? parent.stackIndex : 0;
                this.depth = parent ? parent.depth : 0;
            }
        }
        
        declare(name) {
            // B"H - Idempotent Declaration
            if (this.locals.has(name)) {
                return this.locals.get(name);
            }
            const index = this.stackIndex++;
            this.locals.set(name, index);
            return index;
        }
        
        resolve(name) {
            if (this.locals.has(name)) {
                return { type: 'LOCAL', index: this.locals.get(name), depth: 0 };
            }

            if (this.parent) {
                const res = this.parent.resolve(name);
                if (res.type === 'GLOBAL') return res;

                if (!this.isFunctionBoundary) {
                    return res; 
                } else {
                    return { 
                        type: 'UPVALUE', 
                        index: res.index, 
                        depth: res.depth + 1 
                    };
                }
            }
            
            return { type: 'GLOBAL' };
        }
    }

    globalScope.MerkavaCompiler.Scope = CompilerScope;
    console.log("[MerkavaCompiler] Scope Class Defined and Attached.");

})(typeof self !== 'undefined' ? self : this);
