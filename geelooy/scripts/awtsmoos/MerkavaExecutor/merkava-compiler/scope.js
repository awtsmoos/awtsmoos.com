
// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};

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
            // If the name is already declared in this scope, return its existing index.
            // This is crucial for the multi-pass compiler strategy (Hoisting).
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

    root.MerkavaCompiler.Scope = CompilerScope;
})(typeof self !== 'undefined' ? self : this);
